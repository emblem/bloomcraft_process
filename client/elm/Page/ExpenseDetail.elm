module Page.ExpenseDetail exposing (Model, Msg, init, update, view)

import Task exposing (Task)
import Html exposing (Html, text, h2, p, div)
import Html.Attributes exposing (colspan, class, style, for, href)
import Bootstrap.Grid as Grid
import Bootstrap.Grid.Col as Col
import Bootstrap.Table as Table
import Bootstrap.Form as Form
import Bootstrap.Form.Input as Input
import Bootstrap.Card as Card
import Bootstrap.Form.InputGroup as InputGroup
import Bootstrap.Button as Button
import Bootstrap.Alert as Alert

import Http

import Data.Allocation as Allocation exposing (Expense, Vote)
import Page.Errored exposing (PageLoadError, pageLoadError)
import Request.Allocation
import View.Page as Page
import Route
import Data.Session exposing (Session)


type alias Model =
    { expense : Expense          
    , personalMax : Maybe (Result String Int)
    , globalMax : Maybe (Result String Int)
    , weight : Maybe (Result String Int)
    , rank : Maybe (Result String Int)
    , userIsOwner : Bool
    }

type Msg
    = SetWeight String
    | SetGlobalMax String
    | SetPersonalMax String
    | SetRank String
    | SubmitVote
    | VoteResponse (Result Http.Error String)

init : Allocation.Slug -> Task PageLoadError Model
init slug =
        let
        loadExpense = Http.toTask (Request.Allocation.expense slug)
        loadVote = Http.toTask (Request.Allocation.vote slug)

        handleLoadError err =
            let
                l = Debug.log "Expense Load Err" err
            in
                pageLoadError (Page.Other) "Failed to load expense"

        initModel : (Bool, Expense) -> Maybe Vote -> Model
        initModel (userIsOwner, expense) maybeVote =
            { expense = expense              
            , weight = Just ( Ok (maybeVote |> Maybe.map .weight |> Maybe.withDefault 1))
            , rank = Just ( Ok (maybeVote |> Maybe.map .rank |> Maybe.withDefault 1))
            , personalMax = maybeVote |> Maybe.andThen .personalPctMax |> Maybe.map (\x -> Ok (round(100*x)))
            , globalMax = maybeVote |> Maybe.andThen .globalMax |> Maybe.map Ok
            , userIsOwner = userIsOwner
            }            
    in
        Task.map2 initModel loadExpense loadVote
            |> Task.mapError handleLoadError



view : Model -> Html Msg
view model =
    let
        expense = model.expense
    in
        Grid.container []
            [ Grid.row []
                  [ Grid.col [ Col.lg6 ] [ expenseView model.userIsOwner expense ]
                  , Grid.col [ Col.lg6 ] [ voteView model ]
                  ]
            ]

expenseView : Bool -> Expense -> Html Msg
expenseView showButtons expense =
    Card.config [ Card.attrs [class "mt-2" ]]
        |> Card.headerH4 []
           [ text <| "Expense: " ++ expense.name ]
        |> Card.block []
           [ Card.custom <|
                 div []
                 [ Alert.info [text expense.detailText]
                 , expenseSummaryTable expense
                 , if showButtons then editButtons expense else div [] []
                 ]                 
           ]
        |> Card.view

editButtons : Expense -> Html Msg
editButtons expense =
    div []
        [ Button.linkButton [Button.secondary, Button.attrs [Route.href <| Route.EditExpense expense.slug]] [ text "Edit Expense" ]
        , Button.linkButton [Button.danger, Button.attrs [class "ml-2", Route.href <| Route.DeleteExpense expense.slug]] [ text "Delete Expense" ]
        ]
            
voteView : Model -> Html Msg
voteView model =
    Card.config [ Card.attrs [class "mt-2" ]]
        |> Card.headerH4 []
           [ text "Your Vote" ]
        |> Card.block []
           [ Card.custom <| voteForm model]
        |> Card.view

voteForm : Model -> Html Msg
voteForm model =
    let
        viewString maybeVal = maybeVal |> Maybe.map toString |> Maybe.withDefault ""

        errState result = case result of
                              Just (Ok val) -> ([], ".", toString val, [style [("visibility", "hidden")]])
                              Nothing -> ([], ".", "", [style [("visibility","hidden")]])
                              Just (Err msg) -> ([ Form.groupDanger ], "Must be a whole number", "", [])
                              
        (wError, wValTxt, wDef, wHidden) = errState model.weight 
        (gError, gValTxt, gDef, gHidden) = errState model.globalMax
        (pError, pValTxt, pDef, pHidden) = errState model.personalMax
        (rError, rValTxt, rDef, rHidden) = errState model.rank

        orError maybeErr val = val || ( case maybeErr of
                                            Just (Err _) -> False
                                            _ -> False
                                      )
        andSuccess maybeErr val = val && ( case maybeErr of
                                               Just (Ok _) -> True
                                               _ -> False
                                         )
                                           
        disableSubmit = Debug.log "DIS" <| (List.foldr orError False
                        [model.weight, model.globalMax, model.personalMax, model.rank])
                        || (not <| List.foldr andSuccess True [model.weight, model.rank])

    in
        Form.form []
            [ Form.group rError
                  [ Form.label [ for "rank" ] [ text "Expense Item Rank (1 is the most important)" ]
                  , Input.number [ Input.id "rank", Input.onInput SetRank, Input.defaultValue rDef ]
                  , Form.help [] [ text  "Rank how important this expense is to you.  Lower ranked items will receive no funding until higher ranked items are fully funded.  If two or more items are ranked equally, your funding will be split between them based on the weights you give them." ]
                  , Form.validationText rHidden [ text rValTxt ]
                  ]
{--            , Form.group gError
                [ Form.label [ for "global_max" ] [ text "Funding Limit" ]
                , InputGroup.config (InputGroup.text
                                         [ Input.placeholder gDef
                                         , Input.onInput SetGlobalMax
                                         ]
                                    )
                |> InputGroup.predecessors [ InputGroup.span [] [ text "$" ] ]
                |> InputGroup.view
                , Form.help [] [ text "Optional: You will stop funding this expense once its allocation reaches this limit" ]
                , Form.validationText gHidden [ text gValTxt ]                                        
                ]
--}
            , Form.group wError
                [ Form.label [ ] [ text "Expense Weight (1-100)" ]
                , Input.number
                    [ Input.placeholder wDef
                    , Input.onInput SetWeight
                    ]
                , Form.help [] [ text "If you've ranked one or more items equally, your funding will be split between those items based on their relative weights.  Equally weighted items receive equal funding, while an item with twice the weight of another item will receive twice as much funding." ]
                , Form.validationText wHidden [ text wValTxt ]
                ]
            , Form.group pError
                [ Form.label [ ] [ text "Maximum Funding (Optional)" ]
                , InputGroup.config (InputGroup.number
                                         [ Input.placeholder pDef
                                         , Input.onInput SetPersonalMax
                                         ]
                                    )
                |> InputGroup.predecessors [ InputGroup.span [] [ text "%" ] ]
                |> InputGroup.view
                , Form.help [] [ text "Optional: If you choose a maximum funding limit you will stop funding this expense once your contribution reaches the specified percent of your personal share of the surplus." ]
                , Form.validationText pHidden [ text pValTxt ]
                ]
            , Button.button [Button.primary, Button.onClick SubmitVote, Button.disabled disableSubmit] [ text "Vote" ]
            , Button.linkButton [ Button.secondary, Button.attrs [class "ml-3", Route.href Route.Expense] ] [ text "Back to Expense Summary" ]
            ]
        
            

expenseSummaryTable : Expense -> Html a
expenseSummaryTable expense =
    let
        maybeNot x = if x then "" else "not"
    in
        Table.table
            { options = [Table.striped, Table.small]
            , thead = Table.simpleThead []
            , tbody =
                Table.tbody []
                    [ Table.tr []
                          [ Table.td [] [text "Requested this cycle"]
                          , Table.td [] [text <| "$" ++ toString expense.requestedFunds]
                          ]
                    , Table.tr []
                          [ Table.td [] [text "Currently allocated this cycle"]
                          , Table.td [] [text <| "$" ++ toString expense.newAllocatedFunds]
                          ]
                    , Table.tr []
                        [ Table.td [] [text "Carried over from previous cycle"]
                        , Table.td [] [text <| "$" ++ toString expense.currentAllocatedFunds]
                        ]
                    , Table.tr []
                        [ Table.td [] [text "Person responsible"]
                        , Table.td [] [text expense.owner]
                        ]
                    , Table.tr []
                        [ Table.td [Table.cellAttr (colspan 2)]
                              [text <| "Will " ++ maybeNot expense.excessAllowed++ " accept more than requested"]
                        ]
                    , Table.tr []
                        [ Table.td [Table.cellAttr (colspan 2)]
                              [text <| "Will " ++ (maybeNot expense.partialAllowed) ++ "accept less than requested"]
                        ]
                    ]
            }

            
update : Session -> Msg -> Model -> (Model, Cmd Msg)
update session msg model =
    let
        maybeToInt str = case str of
                             "" -> Nothing
                             _ -> Just (String.toInt str)

        intToPct val = ((toFloat val)/100)
                                  
        makeVote model weight rank =
            { weight = weight
            , rank = rank
            , personalPctMax = model.personalMax |> Maybe.andThen Result.toMaybe |> Maybe.map intToPct
            , personalMax = Nothing
            , globalMax = model.globalMax |> Maybe.andThen Result.toMaybe
            }
    in
        case msg of
            SubmitVote ->
                case (model.weight, model.rank) of
                    (Just (Ok weight), Just (Ok rank)) ->
                        (model, Http.send VoteResponse (Request.Allocation.postVote session (makeVote model weight rank) model.expense.slug) )
                    _ ->
                        (model, Cmd.none)
                    
            SetWeight str ->
                case str of
                    "" -> ({model | weight = Just (Err "Must have weight")}, Cmd.none)
                    _ -> ({model | weight = maybeToInt str}, Cmd.none)
                            
                    
            SetGlobalMax str ->
                ({model | globalMax = maybeToInt str}, Cmd.none)
                           
            SetPersonalMax str ->
                ({model | personalMax = maybeToInt str}, Cmd.none)

            SetRank str ->
                ({model | rank = maybeToInt str}, Cmd.none)

            VoteResponse (Ok _) -> (model, Route.modifyUrl Route.Expense)
                                   
            VoteResponse (Err _) -> (model, Cmd.none)
