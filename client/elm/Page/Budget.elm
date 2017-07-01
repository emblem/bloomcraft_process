module Page.Budget exposing (init, Model, view, Msg, update, subscriptions)

import AnimationFrame

import Bootstrap.Alert as Alert
import Bootstrap.Button as Button
import Bootstrap.Card as Card
import Bootstrap.Form as Form
import Bootstrap.Form.Input as Input
import Bootstrap.Form.InputGroup as InputGroup
import Bootstrap.Grid as Grid
import Bootstrap.Grid.Col as Col
import Bootstrap.ListGroup as ListGroup
import Data.Budget exposing (Budget, Lease)
import Data.Session exposing (Session)
import Html exposing (Html,text,div)
import Html.Attributes exposing (class)
import Http
import Page.Errored exposing (pageLoadError, PageLoadError)
import Request.Budget
import Svg exposing (svg, g, line, rect)
import Svg.Attributes exposing (viewBox, width, transform)
import Task exposing (Task)
import Time exposing (Time)
import View.BarPlot as BarPlot exposing (..)
import View.Colors exposing (..)
import View.Page as Page
import Animation exposing (lerp)

type alias Model =
    { budget : Budget
    , requestedRent : Result String Int
    , time : Time
    , animation : Maybe Animation
    }

type Msg
    = NewBudget (Result Http.Error Budget)
    | RentChanged (Result Http.Error ())
    | UpdateRentInput String
    | ChangeRent
    | Animate Time
      
    
type alias Animation =
    { startTime : Maybe Time
    , budget : (Time -> Time -> Budget -> Budget)
    }

init : Task PageLoadError Model
init =
    let
        loadBudget = Http.toTask Request.Budget.budget

        handleLoadError err =
            let
                l = Debug.log "Budget Load Err" err
            in
                pageLoadError Page.Budget "Failed to load budget"

        initModel : Budget -> Time -> Model
        initModel budget time =
            { budget = budget
            , requestedRent = Err ""
            , time = time
            , animation = Nothing
            }
            
    in
        Task.map2 initModel loadBudget Time.now
            |> Task.mapError handleLoadError

update : Session -> Msg -> Model -> (Model, Cmd Msg)
update session msg model =
    case msg of
        NewBudget (Err err) -> (Debug.log (toString err) model, Cmd.none)
        NewBudget (Ok budget) ->
            ( { model | budget = budget
              , animation =
                  let
                        currentAnimatedBudget : Budget
                        currentAnimatedBudget = animate model
                   in
                       Just
                       { startTime = Nothing
                       , budget = Animation.slide (interpolateBudget currentAnimatedBudget)
                       }
              }
            , Cmd.none
            )
        ChangeRent ->
            (model, case model.requestedRent of
                        Ok rent -> Http.send RentChanged (Request.Budget.changeRent rent session) 
                        Err _ -> Cmd.none)
        RentChanged (Ok _) ->
            ( model, Http.send NewBudget Request.Budget.budget )
                
        RentChanged (Err error) -> ( model, Cmd.none )

        UpdateRentInput input ->
            ({model | requestedRent = validateRent input }, Cmd.none)

        Animate time ->
            case model.animation of
                Just animation ->
                     case animation.startTime of
                         Just startTime ->
                             if startTime + Time.second > time then
                                 ({model | time = time}, Cmd.none)
                             else
                                 ({model | time = time, animation = Nothing}, Cmd.none)

                         Nothing ->
                             ({model | time = time, animation = Just { animation | startTime = Just time } }, Cmd.none)
                Nothing ->
                    ({model | time = time}, Cmd.none)
               
view : Session -> Model -> Html Msg
view session model =
    let
        animatedBudget = animate model
    in
        Grid.row [] <| List.concat
            [ [ Grid.col [Col.md6] [ explainerText animatedBudget ] ]
            , leaseDetailViews model animatedBudget
            , [ Grid.col [Col.md12] <| [compareRentsView animatedBudget] ]
            ]


animate : {m | time : Time, animation : Maybe Animation, budget : Budget } -> Budget
animate {time, animation, budget}  =
    case animation of
        Just justAnimation ->
            case justAnimation.startTime of
                Just startTime -> justAnimation.budget startTime time budget                                 
                Nothing -> justAnimation.budget 0 0 budget
                           
        Nothing -> budget

explainerText : Budget -> Html Msg
explainerText budget =
    let
        income = totalIncome budget
        coreExpense = budget.coreExpenses

        format num =
            let
                intStr = toString (round(num*1000))
            in
                (String.left 2 intStr) ++ "." ++ (String.right 1 intStr)
            
                      
        showPct num = (format num) ++ "%"
                      
    in
        Card.config [ Card.attrs [class "mt-2" ]]
            |> Card.headerH3 []
               [ text "Summary of Budget"
               ]
            |> Card.block []
               [ Card.custom <| 
                     div [] [ Grid.row [] [ Grid.col [] [ topLineSvg budget ] ]
                            , summaryRow "Core Expenses:" <| "$" ++ (toString <| round budget.coreExpenses)
                            , summaryRow "Proposed Income:" <| "$" ++ (toString <| round (totalIncome budget))
                            , summaryRow "Current Income:" <| "$" ++ (toString <| startingIncome budget)
                            , summaryRow "Discretionary:" <| "$" ++ toString (round (Basics.max 0 (income - coreExpense)))
                            , summaryRow "Default Increase:" <| showPct <| requiredPctIncrease budget
                            ]
               ]
            |> Card.view
    

leaseDetailViews : Model -> Budget -> List (Grid.Column Msg)
leaseDetailViews model budget =
    let        
        leases = List.filter (.name >>  (\n -> List.member n budget.leaseMember)) budget.leases

        detailCards : List (Html Msg)
        detailCards = List.map (leaseDetailView model budget) leases
    in
        List.map (\x -> (Grid.col [Col.md6] [x])) detailCards        

           
leaseDetailView : Model -> Budget -> Lease -> Html Msg
leaseDetailView model budget lease =
    Card.config [ Card.attrs [class "mt-2" ]]
        |> Card.headerH3 []
           [ text lease.name
           ]
        |> Card.block []
           [ Card.custom <| div []
                 [ summaryRow "Proposed New Rent:" ("$" ++ toString (round lease.proposedRent))
                 , summaryRow "Current Rent:" ("$" ++ toString lease.currentRent)
                 , summaryRow "Default New Rent:" ("$" ++ toString (round (lease.currentRent * (1 + requiredPctIncrease budget))))
                 ]
           ]
        |> Card.listGroup           
           [ ListGroup.li [] [changeRentView model budget lease]
           ]
        |> Card.view

               
changeRentView : Model -> Budget -> Lease -> Html Msg
changeRentView model budget viewLease =
    let
        nonAdminView = div [ class "mt-4" ] [ Alert.info [ text <| viewLease.adminName ++ " is able to change the proposed " ++ viewLease.name ++ " rent"] ]

        changeRentButton budget adminLease =
            div [ class "text-center" ]
                  [ rentInputView model ]
    in
        case budget.leaseAdmin of
            Just adminLease ->
                if adminLease == viewLease.name then
                    changeRentButton budget adminLease
                else
                    nonAdminView
            Nothing -> nonAdminView
                     
topLineSvg : Budget -> Html Msg
topLineSvg budget =
    let
        income = totalIncome budget
        coreExpenses = budget.coreExpenses
        scaleMax = 1.5 * (Basics.max income coreExpenses)
        plotParam = BarPlot 0 scaleMax 10
    in
        Grid.row []
            [ Grid.col []
                  [ svg [ viewBox "0 0 110 30", width "100%" ]
                        [g [ transform "translate(5,10)" ]
                             (if income >= coreExpenses then
                                 [ drawBox plotParam (0, income, lightBlueColor )
                                 , drawBox plotParam (0, coreExpenses, blueColor)
                                 , annotate plotParam [Text "Proposed Rent", Type (Bracket 0 income)]
                                 , annotate plotParam [Text "Core Expenses", Type (Bracket 0 coreExpenses), Location Above]
                                 ]
                             else 
                                 [ drawBox plotParam (0, coreExpenses, redColor )
                                 , drawBox plotParam (0, income, blueColor)
                                 , annotate plotParam [Text "Proposed Rent", Type <| Bracket 0 income]
                                 --                             , drawSeparator plotParam coreExpenses
                                 , annotate plotParam  [Text "Core Expenses", Type <| Bracket 0 coreExpenses, Location Above]
                                 ]
                             )
                        ]
                  ]
            ]

rentInputView : Model -> Html Msg
rentInputView model =
    div []
        [ InputGroup.config
          ( InputGroup.number [ Input.placeholder (toString 0), Input.onInput (UpdateRentInput)] )
        --                             |> InputGroup.large
        |> InputGroup.predecessors
              [ InputGroup.span [ ] [text "$"] ]
        |> InputGroup.successors
              [ InputGroup.button (List.append
                                       (case model.requestedRent of
                                            Ok _ -> []
                                            Err _ -> [Button.disabled True]
                                       )
                                       [ Button.primary, Button.onClick <| ChangeRent ]
                                  ) [ text "Change" ] ]
        |> InputGroup.view
        , Form.validationText [] (case model.requestedRent of
                              Ok _ -> []
                              Err msg -> [text msg]
                       )
        ]
             
             
change : Lease -> Float
change lease =
    (lease.proposedRent - lease.currentRent)/lease.currentRent
           
compareRentsView : Budget -> Html Msg
compareRentsView budget =
    Card.config [ Card.attrs [class "mt-2"] ]
        |> Card.headerH3 []
           [ text "Proposed Changes"
           ]
        |> Card.block []
           [ Card.custom <|
                 compareRentsByPctChangePlot budget
           ]
        |> Card.view

compareRentsByPctChangePlot : Budget -> Html Msg
compareRentsByPctChangePlot budget =
    let
        unsortedLeases = budget.leases
        increasePct = requiredPctIncrease budget
                         
        changes = List.map change leases
        maxChange = Basics.max (increasePct + 0.05) (List.maximum changes |> Maybe.withDefault 0)
        minChange = Basics.min 0 (List.minimum changes |> Maybe.withDefault 0)

        barWidth = (BarPlot minChange maxChange)
        pp = barWidth 5

        drawLease pos lease = g [ transform <| "translate (0, " ++ (toString ((toFloat pos)*(pp.height+1))) ++ ")" ]
                          [ viewRent pp lease increasePct ]
        nLease = (List.length leases)

        sortedLeases = unsortedLeases |> List.sortBy change |> List.reverse

        leaseName lease = lease.name

        leasePair : (List Lease, List Lease)
        leasePair = List.partition (.name >> (\n -> List.member n budget.leaseMember)) sortedLeases

        (usersLeases, otherLeases) = leasePair
                    
        leases : List Lease
        leases = List.append usersLeases otherLeases
    in
        svg [ viewBox <| "0 0 120 " ++ (toFloat(nLease) * (pp.height+1) + 10 |> toString), width "100%" ]            
            [ g [transform "translate(20,10)"] <|
                  List.concat
                      [ List.indexedMap drawLease leases
                      , [ annotate (barWidth ((toFloat nLease) * (pp.height+1)))
                              [Text "Default" , Location Above, Type (Separator increasePct), Size "3px"]
                        , annotate (barWidth ((toFloat nLease) * (pp.height+1)))
                              [Text "Current", Location Above, Type (Separator 0), Size "3px"]
                        ] 
                      ]
            ]
            
pctStr : Float -> String
pctStr x =
    let
        signStr x = if x > 0 then "+" else ""
    in
        (signStr x) ++ (round (x * 100) |> toString) ++ "%"            
            
viewRent : BarPlot -> Lease -> Float -> Svg.Svg a
viewRent pp lease baseLine =
    let
        val = change lease
        color = if round(lease.proposedRent) >= floor ((1 + baseLine) * lease.currentRent) then
                    blueColor
                else
                    redColor

    in
        g [] [drawBox pp (0, val, color)
             , annotate pp [Text lease.name, Location (Inside Left), Type (TextOnly 0), Size "3px"]
             , annotate pp [Text <| pctStr (val-baseLine), Location (Inside Right), Type (TextOnly 0), Size "3px"]
             ]            

startingIncome : Budget -> Float
startingIncome budget =
    budget.leases |> List.map .currentRent |> List.sum
                
totalIncome : Budget -> Float
totalIncome budget =
    List.sum <|
        List.map (\t -> t.proposedRent) budget.leases

requiredPctIncrease : Budget -> Float
requiredPctIncrease budget =
    let
        income = startingIncome budget
        expenses = budget.coreExpenses
    in
        Basics.max 0 ((expenses - income)/income)

            
summaryRow : String -> String -> Html Msg
summaryRow lStr rStr =
    Grid.row []
        [ Grid.col [ Col.attrs [class "pr-0"]] [
               div [ class "text-right" ] [text lStr ] ]
        , Grid.col [ ] [ text rStr ]
        ]


validateRent : String -> Result String Int
validateRent input =
    if String.length input == 0 then
        Err ""
    else
        case String.toInt input of
            Ok rent ->
                if rent >= 0 then
                    Ok rent
                else
                    Err "Nice try.  Rent can't be negative"
            Err msg -> Err "Rent must be a whole number"       


        
interpolateBudget : Budget -> Float -> Budget-> Budget
interpolateBudget startBudget u targetBudget =
    let
        sB = startBudget
        tB = targetBudget

        interpolateLease : Float -> Maybe Lease -> Lease -> Lease
        interpolateLease u maybeSL tL = case maybeSL of
                                          Just sL -> { tL | currentRent = Animation.lerp sL.currentRent tL.currentRent u
                                                     , proposedRent = Animation.lerp sL.proposedRent tL.proposedRent u
                                                     }
                                          Nothing -> tL

        findLease : List Lease -> Lease -> Maybe Lease
        findLease leaseList targetLease =
            let
                (matched, _) = List.partition (\lease -> lease.name == targetLease.name) leaseList
            in
                case matched of
                    [match] -> Just match
                    _ -> Nothing

        interpIfFound : Float -> List Lease -> Lease -> Lease
        interpIfFound u sLlist tL =
            interpolateLease u (findLease sLlist tL) tL

        interpolateLeases : Float -> List Lease -> List Lease -> List Lease                            
        interpolateLeases u sLList tLList =
            List.map (interpIfFound u sLList) tLList
             
    in
        { tB | coreExpenses = Animation.lerp sB.coreExpenses tB.coreExpenses u
        , leases = interpolateLeases u sB.leases tB.leases
        }

-- SUBSCRIPTIONS --

subscriptions : Model -> Sub Msg
subscriptions model =
 case model.animation of
     Just animation ->
         AnimationFrame.times Animate

     Nothing ->
         Sub.none
