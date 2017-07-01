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
import Bootstrap.ListGroup as ListGroup

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
                          [ [ Grid.col [Col.md6] [ explainerText animatedBudget ] ]
                          , leaseDetailViews model animatedBudget
                          , [ Grid.col [Col.md12] <| [compareRentsView animatedBudget] ]
                          ]
                    ]
            _ -> [div [] [ Html.text "Loading ..." ]]

updateAnimationTime : Model a -> Time -> Model a
updateAnimationTime model time =
    { model | time = Just time }


requestBudget : Cmd Msg
requestBudget =
    Http.send NewBudget <|
        Http.getString "budget.json"
            

