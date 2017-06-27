module Budget exposing (..)

import Svg exposing (..)
import Svg.Attributes exposing (..)
import BarPlot exposing (..)
import Html exposing (Html, div, text)
import Http
import Json.Decode exposing (..)

import Bootstrap.Button as Button
import Bootstrap.Grid as Grid
import Bootstrap.Modal as Modal

type alias Model =
    { loading : Bool
    , budget : Budget
    , change_modal : Modal.State
    }

type alias Budget = {
        core_expenses : Float,
        rents : List (Float, String)
    }
    
type Msg = NewBudget (Result Http.Error String) | ChangeRent Modal.State
    
init : Model
init = (Model True (Budget 0 []) Modal.hiddenState)
            
view : Model -> (Msg -> a) -> List (Html a)
view model msg =
    case model.loading of
        True -> [div [] [ Html.text "Loading ..." ]]
        False ->
            [ Grid.row [] [ Grid.col [] [ topLineSvg model ] ]
            , Grid.row [] [ Grid.col [] [changeRentView model msg] ]
            , Grid.row [] [ Grid.col [] (List.map viewRent model.budget.rents) ]
            ]

changeRentView : Model -> (Msg -> a) -> Html a
changeRentView model msg =
    Button.button
        [ Button.primary
        , Button.large
        , Button.onClick <| msg (ChangeRent Modal.visibleState)
        ]
    [ Html.text "Change My Rent" ]
                     
topLineSvg : Model -> Html a
topLineSvg model =
    let
        income = totalIncome model.budget
    in
        Grid.row []
            [ Grid.col []
                  [ svg [ viewBox "0 0 110 20", width "100%" ]
                        [g [ transform "translate(5,0)" ]
                             [barPlot (BarPlot 0 model.budget.core_expenses income)
                                  [ ("Current Income", 0, income) ]
                             ]
                        ]
                  ]
            ]

viewRent : (Float, String) -> Html a
viewRent (rent, name) =
    svg [ viewBox "0 0 100 10", width "75%" ]
        [ g [] [barPlot (BarPlot 0 (rent*2) rent) []],
          text_ [ x "0", y "5", alignmentBaseline "central", Svg.Attributes.style "font-size: 8px", pointerEvents "none"]
              [ Svg.text name ]
        ]
          
            
update : Model -> Msg -> (Model, Cmd Msg)
update model msg =
    case msg of
        NewBudget (Err err) -> (Debug.log (toString err) model, Cmd.none)
        NewBudget (Ok str) ->
            case (decodeString budgetDecoder str) of
                Err err -> (Debug.log (toString err) model, Cmd.none)
                Ok budget -> (Debug.log "Model Updated:" {model | budget = budget, loading = False}, Cmd.none )
        ChangeRent state -> ({ model | change_modal = state }, Cmd.none)

requestBudget : Cmd Msg
requestBudget =
    Http.send NewBudget <|
        Http.getString "budget.json"
            
budgetDecoder : Decoder Budget
budgetDecoder =
    let
        rent = Json.Decode.map2 (,) (field "rent" float) (field "lease" Json.Decode.string)
    in
        Json.Decode.map2 Budget
            (field "core_expenses" float)
            (field "rents" (list rent))
                            

totalIncome : Budget -> Float
totalIncome budget =
    List.sum <|
        List.map Tuple.first budget.rents
