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
    }

type Msg
    = SetWeight String
    | SetGlobalMax String
    | SetPersonalMax String
    | SubmitVote
    | VoteResponse (Result Http.Error String)
    | LoadedExpense (Result Http.Error Expense)

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

        initModel : Expense -> Maybe Vote -> Model
        initModel expense maybeVote =
            { expense = expense              
            , weight = maybeVote |> Maybe.andThen .weight |> Maybe.map Ok
            , personalMax = maybeVote |> Maybe.andThen .personalMax |> Maybe.map Ok
            , globalMax = maybeVote |> Maybe.andThen .globalMax |> Maybe.map Ok
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
                  [ Grid.col [ Col.lg6 ] [ expenseView expense ]
                  , Grid.col [ Col.lg6 ] [ voteView model ]
                  ]
            ]

expenseView : Expense -> Html Msg
expenseView expense =
    Card.config [ Card.attrs [class "mt-2" ]]
        |> Card.headerH4 []
           [ text <| "Expense: " ++ expense.name ]
        |> Card.block []
           [ Card.custom <|
                 div []
                 [ Alert.info [text expense.detailText]
                 , expenseSummaryTable expense
                 ]
           ]
        |> Card.view
            
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

        disableSubmit = Debug.log "DIS" (case (model.weight, model.globalMax, model.personalMax) of
                           (Just (Err _), _, _) -> True
                           (_, Just (Err _), _) -> True
                           (_, _, Just (Err _)) -> True                                                     
                           _ -> False)

    in
        Form.form []
            [ Form.group wError
                  [ Form.label [ for "weight" ] [ text "Importance (0-100)" ]
                  , Input.text [ Input.id "weight", Input.onInput SetWeight, Input.defaultValue wDef ]
                  , Form.help [] [ text  "How important is this expense?  Higher numbers get funded first. Equal numbers are funded equally." ]
                  , Form.validationText wHidden [ text wValTxt ]
                  ]
            , Form.group gError
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
            , Form.group pError
                [ Form.label [ ] [ text "Personal Limit" ]
                , InputGroup.config (InputGroup.text
                                         [ Input.placeholder pDef
                                         , Input.onInput SetPersonalMax
                                         ]
                                    )
                |> InputGroup.predecessors [ InputGroup.span [] [ text "$" ] ]
                |> InputGroup.view
                , Form.help [] [ text "Optional: You will stop funding this expense once your contribution reaches this limit" ]
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
                                  
        makeVote model =
            { weight = model.weight |> Maybe.andThen Result.toMaybe
            , personalMax = model.personalMax |> Maybe.andThen Result.toMaybe
            , globalMax = model.globalMax |> Maybe.andThen Result.toMaybe
            }
    in
        case msg of
            SubmitVote ->
                (model, Http.send VoteResponse (Request.Allocation.postVote session (makeVote model) model.expense.slug) )
                    
            SetWeight str ->
                ({model | weight = maybeToInt str}, Cmd.none)
                            
                    
            SetGlobalMax str ->
                ({model | globalMax = maybeToInt str}, Cmd.none)
                           
            SetPersonalMax str ->
                ({model | personalMax = maybeToInt str}, Cmd.none)
            
            VoteResponse (Ok _) -> (model, Cmd.batch
                                        [ Http.send LoadedExpense (Request.Allocation.expense model.expense.slug)
                                        , Route.modifyUrl Route.Expense
                                        ])
                                   
            VoteResponse (Err _) -> (model, Cmd.none)

            LoadedExpense (Ok expense) -> ({model | expense = expense}, Cmd.none)
                                          
            LoadedExpense (Err _) -> (model, Cmd.none)