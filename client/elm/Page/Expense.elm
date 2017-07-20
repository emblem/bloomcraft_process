module Page.Expense exposing (Msg, Model, update, view, init)

import Http
import Html exposing (Html, text, div, p, a, hr, span)
import Html.Attributes exposing (class, style, href, colspan)
import Svg exposing (svg, g, Svg)
import Svg.Attributes exposing (viewBox, transform, width)
import Task exposing (Task)

import Bootstrap.Grid as Grid
import Bootstrap.Grid.Col as Col
import Bootstrap.Grid.Row as Row
import Bootstrap.Card as Card
import Bootstrap.Button as Button
import Bootstrap.Table as Table

import View.PieChart exposing (pieChart)
import Request.Allocation
import Data.Allocation exposing (Allocation, Expense, Vote, Slug)
import Data.Session exposing (Session)
import Page.Errored exposing (pageLoadError, PageLoadError)
import View.Page as Page
import Route

import View.BarPlot exposing (..)
import View.Colors exposing (..)

type alias Model =
    { allocation : Allocation
    , votes : List (Expense, Maybe Vote)
    }


view : Model -> Html Msg
view model =
    Grid.container []
        [ Grid.row [Row.centerMd]
          [ Grid.col [ Col.lg12 ]
            [ voteSummaryView model ]
          , Grid.col [ Col.lg6 ]              
              [ allocationSummary model ]
          , Grid.col [ Col.lg6 ]
              [ expenseDetailsView model.allocation.expenses ]
          ]
              
        ]

voteSummaryView : Model -> Html Msg
voteSummaryView model =
    let
        voteSummaryText = "Voting to allocate the current surplus will end at midnight on "
                          ++ model.allocation.decisionDate
                          ++ ".  Until then, you may update your vote on each expense item as many times as you like."
                          ++ " You can vote for as many, or as few, items as you want to."
    in
        Card.config [ Card.attrs [class "mt-2" ]]
            |> Card.headerH3 []
               [ text "Your Current Votes"
               ]
            |> Card.block []
               [ Card.custom <|
                     div [] 
                     [ p [ class "lead" ] [ text voteSummaryText]
                     , voteTable model.votes
                     ]
               ]           
            |> Card.view

voteTable : List (Expense, Maybe Vote) -> Html Msg
voteTable votes =
    let
        rankWeightOrder (a,aname) (b,bname) =
            if (a.rank == b.rank) then
                if (b.weight == a.weight) then
                    compare aname bname
                else
                    compare b.weight a.weight
            else
                compare a.rank b.rank

        compareIfBoth : (Expense, Maybe Vote) -> (Expense, Maybe Vote) -> Order
        compareIfBoth (ea,a) (eb,b) =
            case (a,b) of
                (Just x, Just y) -> rankWeightOrder (x, ea.name) (y, eb.name)
                (Just _, Nothing) -> LT
                (Nothing, Just _) -> GT
                (Nothing, Nothing) -> compare ea.name eb.name

        sortedVotes : List (Expense, Maybe Vote)
        sortedVotes = List.sortWith compareIfBoth votes
    in              
        Table.table
            { options = [Table.striped, Table.small]
            , thead = Table.simpleThead
                      [ Table.th [] [ text "Expense" ]
                      , Table.th [Table.cellAttr <| class "text-center"] [ text "Rank" ]
                      , Table.th [Table.cellAttr <| class "text-center"] [ text "Weight" ]
                      , Table.th [Table.cellAttr <| class "text-center"] [ text "Limit %" ]
                      , Table.th [] [ text "Your Allocation" ]
                      , Table.th [] []
                      ]
            , tbody = Table.tbody [] <| List.map voteView sortedVotes
            }   
                     
voteView : (Expense, Maybe Vote) -> Table.Row Msg
voteView (expense,maybeVote) =
    let
        voteStrings vote = [ Table.td [Table.cellAttr <| class "align-middle text-center"]
                                 [ text <| toString vote.rank ]
                           , Table.td [Table.cellAttr <| class "align-middle text-center"]
                               [ text <| toString vote.weight ]
                           , Table.td [Table.cellAttr <| class "align-middle text-center"]
                               [ text <| case vote.personalPctMax of
                                             Just max ->
                                                 toString (round (100*max)) ++ "%"
                                             Nothing ->
                                                 "None"
                               ]
                           ]
        
        voteCells = case maybeVote of
                                     Just vote ->
                                         voteStrings vote                                             
                                     Nothing ->
                                         [Table.td [Table.cellAttr (colspan 3), Table.cellAttr <| class "align-middle text-center"] [text "No Vote"]]

        allocatedAmt = "$" ++ toString expense.userNewAllocatedFunds
    in
        Table.tr [] <| List.concat
            [ [Table.td [ Table.cellAttr <| class "align-middle" ] [text expense.name]]
            , voteCells
            , [ Table.td [ Table.cellAttr <| class "align-middle" ] [text allocatedAmt]
              , Table.td [ Table.cellAttr <| class "align-middle" ]
                  [ div [class "text-left align-middle"] <| List.concat
                        [ [Button.linkButton
                               [ Button.primary
                               , Button.small
                               , Button.attrs[ Route.href (Route.ExpenseDetail expense.slug)]
                               ] [ text <| case maybeVote of
                                               Just vote -> "Change Vote"
                                               Nothing -> "Vote"
                                 ]                                                          
                          ]
                        , case maybeVote of
                              Just vote ->
                                  [ Button.button
                                        [ Button.danger
                                        , Button.small
                                        , Button.onClick <| DeleteVote expense.slug
                                        ] [ text "Delete Vote" ]
                                  ]
                              Nothing -> []
                        ]
                  ]
              ]
            ]
    
allocationSummary : Model -> Html a
allocationSummary model =
    let
        allocation = model.allocation
        amtPerPerson = if allocation.numVoters > 0 then
                           (ceiling (toFloat allocation.amount/toFloat allocation.numVoters))
                       else
                           allocation.amount        
        summaryText =
            "This page shows how the $"
            ++ toString allocation.amount
            ++ " in surplus funds will be allocated."
    in
        Card.config [ Card.attrs [class "mt-2" ]]
            |> Card.headerH3 []
               [ text "Summary of Allocation"
               ]
            |> Card.block []
               [ Card.custom <|
                     div []
                     [ div [ style [("width", "100%"), ("margin", "0 auto")] ]
                           [ svg [ viewBox "-25 -15 150 130" ] [model.allocation |> allocationPieSummary |> pieChart ] ]
                     , p [ class "lead" ] [ text summaryText]
                     ]
               ]           
            |> Card.view

allocationPieSummary : Allocation -> List (Int, String)
allocationPieSummary allocation =
    let
        toPieData expense = (expense.newAllocatedFunds, expense.name)
    in
        allocation.expenses |> List.map toPieData


expenseDetailsView : List Expense -> Html a
expenseDetailsView expenses =
    let
        maxFunds e = max e.requestedFunds (e.currentAllocatedFunds + e.newAllocatedFunds)

        boxCol content = Grid.col [ Col.md6, Col.xs6 ]
                         [ div []
                               [ div [ style [("border-width", "1px"), ("border-style", "solid")
                                             , ("box-shadow", "2px 3px 6px 3px rgba(0,0,0,0.1)")], class "rounded p-1 mb-2" ]
                                     content
                               ]
                         ]
                                                         
        expenseBoxer expense = boxCol
                               [ p [ class "h5" ] [ a [Route.href <| Route.ExpenseDetail expense.slug] [ text expense.name ] ]
                               , svg [ viewBox <| "0 0 100 10"
                                     , width "100%" ] [expenseView expense]
                               , p [class "small mb-0 text-muted"] [text <| "Currently Allocated: $"
                                                                        ++ toString expense.newAllocatedFunds]
                               , p [class "small mb-0 text-muted"] [text <| "Requested: $"
                                                                        ++ toString expense.requestedFunds]
                               ]
    in
        Card.config [ Card.attrs [class "mt-2" ]]
            |> Card.headerH3 []
               [ text "Expenses"
               ]
            |> Card.block []
               [ Card.custom <|                     
                     Grid.row [] <|
                         List.concat
                             [ List.map expenseBoxer expenses
                             , [ boxCol [ div [class "text-center"]
                                              [Button.linkButton
                                                  [ Button.primary
                                                  , Button.attrs [href "/process/expense/create"]
                                                  ] [ text "New Expense" ]
                                              ]
                                        ]
                               ]
                             ]
                                   
               ]           
            |> Card.view
    
            
expenseView : Expense -> Svg a
expenseView expense =
    let
        totalFunds = expense.currentAllocatedFunds + expense.newAllocatedFunds
        width = (max expense.requestedFunds totalFunds)
        pp = {defaultPlotParams | maxValue = toFloat width, height = 10} 

        isFunded = (totalFunds >= expense.requestedFunds)
             
        fundColor = case isFunded of
                        True -> blueColor
                        False -> blueColor

        greyFundColor  = case isFunded of
                             True -> darkGreenColor
                             False -> greyColor
                        
             
        svg = g []
            [ drawBox pp (0, toFloat totalFunds, greyColor)
            , drawBox pp ( toFloat expense.currentAllocatedFunds
                         , toFloat (expense.currentAllocatedFunds + expense.newAllocatedFunds)
                         , fundColor
                         )
            , drawBox {pp | filled = False} (0, toFloat width, "#202020" )
{--            , annotate pp [ Text <| "$" ++ toString totalFunds
                          , Type (TextOnly (toFloat totalFunds))
                          , Location (Inside Right)
                          , Size "30px"
                          ]
--}
--            , annotate pp [ Type (Separator (toFloat expense.requestedFunds)), Location (Inside Right) ]
            ]
    in
        svg
        
         
type Msg
    = DeleteVote Slug
    | VoteResponse (Result Http.Error String)
            
update : Session -> Msg -> Model -> (Model, Cmd Msg)
update session msg model =
    case msg of
        DeleteVote slug ->
            (model, Http.send VoteResponse (Request.Allocation.deleteVote session slug))
        VoteResponse (Ok _) ->
            (model, Route.modifyUrl Route.Expense)
        VoteResponse (Err string) ->
            (model, Cmd.none)
                    

init : Task PageLoadError Model
init =
    let
        loadAllocation = Http.toTask Request.Allocation.allocation
        loadVotes = Http.toTask Request.Allocation.votes

        handleLoadError err =
            let
                l = Debug.log "Expense Load Err" err
            in
                pageLoadError Page.Expense "Failed to load expenses"

        initModel : List (Expense, Maybe Vote) -> Allocation -> Model
        initModel votes allocation =
            { allocation = allocation
            , votes = votes
            }            
    in
        Task.map2 initModel loadVotes loadAllocation 
            |> Task.mapError handleLoadError

