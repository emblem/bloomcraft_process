-- Read more about this program in the official Elm guide:
-- https://guide.elm-lang.org/architecture/user_input/buttons.html

import Html exposing (Html, program, div, text, ul)
import Html.Events exposing (onClick)
import Svg exposing (..)
import Svg.Attributes exposing (..)
import AnimationFrame exposing (times)
import Time exposing (..)
import Ease exposing (..)

import Json.Decode as Json
import Task
import WebSocket
import Navigation

import BarPlot exposing (..)
import BudgetNav as Nav
import Authentication

main : Program Never Model Msg
main = Navigation.program (Nav.urlChange >> LocationChange) {
           init = init,
           view = view,
           update = update,
           subscriptions = subscriptions
       }

type alias Model = {
        rectWidth : Float,
        rectColor : String,
        rectMove : Time -> Float,
        time : Time,
        animationStopTime : Time,
        animationActive : Bool,
        remoteVal : String,
        page : Nav.Page,
        authModel : Authentication.AuthModel
    }
    
view : Model -> Html Msg
view model = div [] [
              div [] [
                   ul [] (Nav.navLinks)
                  ],
                  case model.page of
                      Nav.Home ->
                          svg [ viewBox "0 0 110 15", width "100%", 
                                    Html.Events.on "click" (decodeClick (tickThen (ChangeValue (model.rectWidth + 10)))),
                                    Svg.Attributes.style "background: #AAAAAA"
                              ]
                          [ g [ transform "translate(5,0)" ] [barPlot (BarPlot 0 100 model.rectWidth ) ]]
                      Nav.Login ->
                          Authentication.loginView AuthViewMsg
             ]

decodeClick : msg -> Json.Decoder msg
decodeClick msg =
    Json.succeed msg
    

init : Navigation.Location -> (Model, Cmd Msg)
init location =
    (Model 20 "#FFBBFF" (easeMove 50 50 0 0) 0 0 False "" (Nav.urlChange location) Authentication.initModel, Cmd.none)
             
type Msg = Animate Time | ChangeValue Float | TimeMsg TimeMsg | RemoteUpdate String | LocationChange Nav.Page | AuthViewMsg Authentication.AuthMsg
type TimeMsg = TickThen Msg | Tock Msg Time


easeMove : Float -> Float -> Time -> Time -> Time -> Float
easeMove startPos stopPos duration startTime curTime =
    let
        v = clamp 0 1 ((curTime - startTime)/duration)
    in
        lerp startPos stopPos (outElastic v)
    
update : Msg -> Model -> (Model, Cmd Msg)
update msg model =   
    case msg of
        Animate time ->
            { model | rectWidth = model.rectMove time,
                  animationActive = time < model.animationStopTime } ! []
        ChangeValue newValue ->
            (startMove model newValue) ! [WebSocket.send "ws://echo.websocket.org" (Debug.log "Sent:" (toString newValue))]
        TimeMsg msg ->
            timeMsgUpdate msg model
        RemoteUpdate val ->
            { model | remoteVal = Debug.log "Got: " val } ! []
        LocationChange page -> {model | page = page} ! []
        AuthViewMsg authMsg ->
            let
                (newAuthModel, authCmd) = Authentication.update authMsg model.authModel
            in
                ({ model | authModel = newAuthModel }, Cmd.map AuthViewMsg authCmd)

startMove : Model -> Float -> Model
startMove model newValue =
    { model | rectMove = (easeMove model.rectWidth newValue Time.second model.time),
            animationStopTime = model.time + Time.second,
            animationActive = True
    }
                       
timeMsgUpdate : TimeMsg -> Model -> (Model, Cmd Msg)
timeMsgUpdate msg model =
    case msg of
        TickThen msg -> model ! [Task.perform (\t -> TimeMsg (Tock msg t)) Time.now ]
        Tock msg time -> update msg { model | time = time }

lerp : Float -> Float -> Float -> Float
lerp x0 x1 u =
    u * x1 + (1 - u) * x0

subscriptions : Model -> Sub Msg
subscriptions model =
    Sub.batch [
         if model.animationActive then times Animate else Sub.none,
             Time.every Time.second (\t -> tickThen  (ChangeValue (sin((Time.inSeconds t)/2)*30+50))),
             WebSocket.listen "ws://echo.websocket.org" RemoteUpdate
        ]

tickThen : Msg -> Msg
tickThen msg =
    TimeMsg <| TickThen <| msg
