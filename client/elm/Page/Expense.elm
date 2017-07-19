module Page.Expense exposing (Msg, Model, update, view, init)

import Http
import Html exposing (Html, text, div, p, a, hr)
import Html.Attributes exposing (class, style, href)
import Svg exposing (svg, g, Svg)
import Svg.Attributes exposing (viewBox, transform, width)
import Task exposing (Task)

import Bootstrap.Grid as Grid
import Bootstrap.Grid.Col as Col
import Bootstrap.Grid.Row as Row
import Bootstrap.Card as Card
import Bootstrap.Button as Button

import View.PieChart exposing (pieChart)
import Request.Allocation
import Data.Allocation exposing (Allocation, Expense)
import Page.Errored exposing (pageLoadError, PageLoadError)
import View.Page as Page
import Route

import View.BarPlot exposing (..)
import View.Colors exposing (..)

type alias Model =
    { allocation : Allocation
    }


view : Model -> Html Msg
view model =
    Grid.container []
        [ Grid.row [Row.centerMd]
          [ Grid.col [ Col.lg6 ]              
            [ allocationSummary model ]
          , Grid.col [ Col.lg6 ]
              [ expenseDetailsView model.allocation.expenses ]
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
            ++ " Because "
            ++ toString allocation.numVoters
            ++ " Bloomcraft keyholders have participated so far, you have "
            ++ "$" ++ toString amtPerPerson
            ++ " to allocate. Use the vote buttons to share your preferences, and the allocation will change to reflect them." 
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

        voteResultText expense =
            if expense.userNewAllocatedFunds > 0 then
                " You've allocated $"
                ++ toString expense.userNewAllocatedFunds
                ++ " to this item."
            else
                ""

        boxCol content = Grid.col [ Col.md6, Col.xs6 ]
                         [ div []
                               [ div [ style [("border-width", "1px"), ("border-style", "solid")
                                             , ("box-shadow", "2px 3px 6px 3px rgba(0,0,0,0.1)")], class "rounded p-1 mb-2" ]
                                     content
                               ]
                         ]
                                                         
        expenseBoxer expense = boxCol
                               [ p [ class "h5" ] [ text expense.name ]
                               , svg [ viewBox <| "0 0 100 50"
                                     , width "100%" ] [expenseView expense]
                               , p [class "small mb-0"] [text <| voteResultText expense]                                 
                               , hr [ class "m-1"] []
                               , p [class "small mb-0 text-muted"] [text <| expense.owner
                                                                        ++ " requested $"
                                                                        ++ toString expense.requestedFunds
                                                                        ++ " and is currently allocated $"
                                                                        ++ toString expense.newAllocatedFunds
                                                                        ++ "."
                                                                   ]
                               , Button.linkButton [ Button.primary, Button.block, Button.attrs [Route.href (Route.ExpenseDetail expense.slug)] ] [ text "Vote" ]
                               ]
    in
        Card.config [ Card.attrs [class "mt-2" ]]
            |> Card.headerH3 []
               [ text "Expense Funding"
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
        pp = {defaultPlotParams | maxValue = toFloat width, height = 50} 

        isFunded = (totalFunds >= expense.requestedFunds)
             
        fundColor = case isFunded of
                        True -> greenColor
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
        
         
type Msg =
    AllocationLoaded (Result Http.Error Allocation)
            
update : Msg -> Model -> (Model, Cmd Msg)
update msg model =
    (model, Cmd.none)

init : Task PageLoadError Model
init =
    let
        loadAllocation = Http.toTask Request.Allocation.allocation

        handleLoadError err =
            let
                l = Debug.log "Expense Load Err" err
            in
                pageLoadError Page.Expense "Failed to load expenses"

        initModel : Allocation -> Model
        initModel allocation =
            { allocation = allocation
            }            
    in
        Task.map initModel loadAllocation 
            |> Task.mapError handleLoadError

