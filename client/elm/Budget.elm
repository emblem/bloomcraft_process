module Budget exposing (..)


import Svg exposing (line,svg,g,text_)
import Svg.Attributes exposing (..)
import BarPlot exposing (..)
import Html exposing (Html, div, text, h3)
import Html.Attributes as Attr
import Http
import Time exposing (..)
import Json.Decode exposing (..)

import Bootstrap.Button as Button
import Bootstrap.Grid as Grid
import Bootstrap.Grid.Col as Col
import Bootstrap.Form.InputGroup as InputGroup
import Bootstrap.Form.Input as Input
import Bootstrap.Card as Card
import Bootstrap.Alert as Alert
import Bootstrap.Form as Form

import API
import Animation


type alias Model a =
    { budget : Maybe Budget
    , requestedRent : Result String Int
    , selfRouter : (Msg -> a)
    , time : Maybe Time
    , animations : List Animation
    }

type alias Budget =
    { coreExpenses : Float
    , leases : List (Lease)
    , leaseAdmin : Maybe String
    , leaseMember : List String
    }

type alias Lease =
    { currentRent : Float
    , proposedRent : Float
    , name : String
    , adminName : String
    }

type Msg = NewBudget (Result Http.Error String)
         | PostRentChange
         | RentChanged API.APIResponse
         | UpdateRentInput String

type Animation = Animation (Time -> Budget -> Budget)

init : (Msg -> a) -> Model a
init selfRouter = (Model Nothing (Err "") selfRouter Nothing [])
    
                           
blueColor : String
blueColor = "#0B40CE"

lightBlueColor : String
lightBlueColor = "#2B60EE"

redColor : String
redColor = "#CE292B"

update : Model a -> Msg -> (Model a, Cmd Msg, Maybe (API.Msg a))
update model msg =
    case msg of
        NewBudget (Err err) -> (Debug.log (toString err) model, Cmd.none, Nothing)
        NewBudget (Ok str) ->
            case (decodeString budgetDecoder str) of
                Err err -> (Debug.log (toString err) model, Cmd.none, Nothing)
                Ok budget ->
                    ( { model | budget = Just budget
                      , animations = case (model.time, model.budget) of
                                         (Just time, Just budget) ->
                                             let
                                                 currentAnimatedBudget : Budget
                                                 currentAnimatedBudget = animate time model.animations budget
                                             in
                                                 [Animation <| Animation.slide (interpolateBudget currentAnimatedBudget) time]
                                         _ -> []
                      }
                    , Cmd.none
                    , Nothing
                    )
        PostRentChange ->
            (model, Cmd.none, case model.requestedRent of
                                  Ok rent -> Just <| API.changeRent rent (RentChanged >> model.selfRouter)
                                  Err _ -> Nothing)
        RentChanged response ->
            ( model
            , case response of
                  API.Success -> requestBudget
                  _ -> Cmd.none
            , Nothing)
        UpdateRentInput input ->
            ({model | requestedRent = validateRent input }, Cmd.none, Nothing)

                      
view : Model a -> List (Html a)
view model =
        case (model.time, model.budget) of
            (Just time, Just budget) ->
                let
                    animatedBudget = animate time model.animations budget
                in
                    [ Grid.row [] <|
                          List.concat
                          [ [ Grid.col [Col.sm6] [ explainerText animatedBudget ] ]
                          , leaseDetailViews model animatedBudget
                          , [ Grid.col [Col.sm12] <| [compareRentsView animatedBudget] ]
                          ]
                    ]
            _ -> [div [] [ Html.text "Loading ..." ]]


updateAnimationTime : Model a -> Time -> Model a
updateAnimationTime model time =
    { model | time = Just time }


animate : Time -> List Animation -> Budget -> Budget
animate time animations budget =
    let
        applyAnimation : Animation -> Budget -> Budget
        applyAnimation (Animation animation) model = animation time model
    in
        List.foldl applyAnimation budget animations

explainerText : Budget -> Html a
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
        Card.config [ ]
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
    

leaseDetailViews : Model a -> Budget -> List (Grid.Column a)
leaseDetailViews model budget =
    let        
        leases = List.filter (.name >>  (\n -> List.member n budget.leaseMember)) budget.leases

        detailCards : List (Html a)
        detailCards = List.map (leaseDetailView model budget) leases
    in
        List.map (\x -> (Grid.col [Col.sm6] [x])) detailCards        

           
leaseDetailView : Model a -> Budget -> Lease -> Html a
leaseDetailView model budget lease =
    Card.config [ ]
        |> Card.headerH3 []
           [ text lease.name
           ]
        |> Card.block []           
           [ Card.custom <| div [] <| List.append 
                 [ summaryRow "Current Rent:" ("$" ++ toString lease.currentRent)
                 , summaryRow "Proposed New Rent:" ("$" ++ toString (round lease.proposedRent))
                 , summaryRow "Default New Rent:" ("$" ++ toString (round (lease.currentRent * (1 + requiredPctIncrease budget))))
                 ]
                 (changeRentView model budget lease)
           ]
        |> Card.view

               
changeRentView : Model a -> Budget -> Lease -> List (Html a)
changeRentView model budget viewLease =
    let
        nonAdminView = [ div [ Attr.class "mt-4" ] [ Alert.info [ text <| viewLease.adminName ++ " is able to change the proposed rent"] ]]

        changeRentButton budget adminLease =
            [ div [ Attr.class "text-center" ]
                  [ rentInputView model ]
            ]
    in
        case budget.leaseAdmin of
            Just adminLease ->
                if adminLease == viewLease.name then
                    changeRentButton budget adminLease
                else
                    nonAdminView
            Nothing -> nonAdminView
                     
topLineSvg : Budget -> Html a
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

rentInputView : Model a -> Html a
rentInputView model =
    div []
        [ InputGroup.config
          ( InputGroup.number [ Input.placeholder (toString 0), Input.onInput (UpdateRentInput >> model.selfRouter)] )
        --                             |> InputGroup.large
        |> InputGroup.predecessors
              [ InputGroup.span [ ] [text "$"] ]
        |> InputGroup.successors
              [ InputGroup.button (List.append
                                       (case model.requestedRent of
                                            Ok _ -> []
                                            Err _ -> [Button.disabled True]
                                       )
                                       [ Button.primary, Button.onClick <| model.selfRouter PostRentChange ]
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
           
compareRentsView : Budget -> Html a
compareRentsView budget =
    Card.config [ ]
        |> Card.headerH3 []
           [ text "Proposed Changes"
           ]
        |> Card.block []
           [ Card.custom <|
                 compareRentsByPctChangePlot budget
           ]
        |> Card.view

compareRentsByPctChangePlot : Budget -> Html a
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

            
summaryRow : String -> String -> Html a
summaryRow lStr rStr =
    Grid.row []
        [ Grid.col [ Col.attrs [ Attr.class "pr-0"] ] [
               div [ Attr.class "text-right" ] [text lStr ] ]
        , Grid.col [] [ text rStr ]
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

requestBudget : Cmd Msg
requestBudget =
    Http.send NewBudget <|
        Http.getString "budget.json"
            
budgetDecoder : Decoder Budget
budgetDecoder =
    let
        rent = Json.Decode.map4 Lease
               (field "current_rent" float)
               (field "proposed_rent" float)
               (field "name" Json.Decode.string)
               (field "admin_name" Json.Decode.string)
    in
        Json.Decode.map4 Budget
            (field "core_expenses" float)
            (field "leases" (list rent))
            (maybe <| field "lease_admin" Json.Decode.string)
            (field "lease_member" (list Json.Decode.string))                

        
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
