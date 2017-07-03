module Page.Expense exposing (Msg, Model, update, view, init)

import Http
import Html exposing (Html, text, div, p)
import Html.Attributes exposing (class, style)
import Svg exposing (svg, g, Svg)
import Svg.Attributes exposing (viewBox, transform, width)
import Task exposing (Task)

import Bootstrap.Grid as Grid
import Bootstrap.Grid.Col as Col
import Bootstrap.Card as Card

import View.PieChart exposing (pieChart)
import Request.Allocation
import Data.Allocation exposing (Allocation, Expense)
import Page.Errored exposing (pageLoadError, PageLoadError)
import View.Page as Page

import View.BarPlot exposing (..)
import View.Colors exposing (..)

type alias Model =
    { allocation : Allocation
    }


view : Model -> Html Msg
view model =
    Grid.container []
        [ Grid.row []
          [ Grid.col [ Col.md6 ]              
            [ allocationSummary model ]
          , Grid.col [ Col.md12 ]
              [ expenseDetailsView model.allocation.expenses ]
          ]
              
        ]
        
allocationSummary : Model -> Html a
allocationSummary model =
    let
        allocation = model.allocation
        summaryText =
            "This page shows how the $"
            ++ toString allocation.amount
            ++ " of discretionary funds will be allocated."
            ++ " You can share your preferences, and the allocation will change to reflect them." 
    in
        Card.config [ Card.attrs [class "mt-2" ]]
            |> Card.headerH3 []
               [ text "Summary of Allocation"
               ]
            |> Card.block []
               [ Card.custom <|
                     div []
                     [ div [ style [("width", "75%"), ("margin", "0 auto")] ]
                           [ svg [ viewBox "0 0 100 100" ] [model.allocation |> allocationPieSummary |> pieChart ] ]
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
                 
        expenseBoxer expense =
            Grid.col [ Col.md4 ]
                [ svg [ viewBox <| "0 0 100 50"
                      , width "100%" ] [expenseView expense]
                , p [ class "lead" ] [ text expense.name ]
                ]
    in
        Card.config [ Card.attrs [class "mt-2" ]]
            |> Card.headerH3 []
               [ text "Expense Funding"
               ]
            |> Card.block []
               [ Card.custom <|                     
                     Grid.row [] <|
                         List.map expenseBoxer expenses                     
               ]           
            |> Card.view
    
            
expenseView : Expense -> Svg a
expenseView expense =
    let
        totalFunds = expense.currentAllocatedFunds + expense.newAllocatedFunds
        height = (max expense.requestedFunds totalFunds)
        pp = BarPlot 0 (toFloat height) 50

        svg = g []
            [ drawBox pp (0, toFloat expense.requestedFunds, redColor)
            , drawBox pp (0, toFloat totalFunds, blueColor)
            , drawBox pp (toFloat expense.currentAllocatedFunds, toFloat (expense.currentAllocatedFunds + expense.newAllocatedFunds), lightBlueColor)
            , annotate pp [ Text <| "$" ++ toString totalFunds
                          , Type (TextOnly (toFloat totalFunds))
                          , Location (Inside Right)
                          , Size "30px"
                          ]
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
        loadExpense = Http.toTask Request.Allocation.allocation

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
        Task.map initModel loadExpense 
            |> Task.mapError handleLoadError

