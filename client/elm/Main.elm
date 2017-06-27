module Main exposing (main)
-- Read more about this program in the official Elm guide:
-- https://guide.elm-lang.org/architecture/user_input/buttons.html

import Html exposing (Html, program, div, text, ul)
--import Html.Attributes exposing (..)
import AnimationFrame exposing (times)
import Time exposing (..)
import Ease exposing (..)

import Json.Decode as Json
import Task
import WebSocket
import Navigation

import BudgetNav as Nav
import Authentication
import Budget

import Bootstrap.Navbar as Navbar
import Bootstrap.Grid as Grid
--import Bootstrap.Grid.Col as Col
--import Bootstrap.Card as Card
--import Bootstrap.Button as Button
--import Bootstrap.ListGroup as Listgroup
--import Bootstrap.Modal as Modal

main : Program Never Model Msg
main = Navigation.program (Nav.urlChange >> LocationChange) {
           init = init,
           view = view,
           update = update,
           subscriptions = subscriptions
       }

type alias Model =
    { rectWidth : Float
    , rectMove : Time -> Float
    , time : Time
    , animationStopTime : Time
    , animationActive : Bool
    , remoteVal : String
    , page : Nav.Page
    , auth : Authentication.Model
    , budget : Budget.Model
    , navbar : Navbar.State
    }
    
view : Model -> Html Msg
view model = div []
             [ Nav.menu NavMsg model.navbar
             , mainContent model
             , modal model
             ]

mainContent : Model -> Html Msg
mainContent model =
    Grid.container [] <|
        case model.page of
            Nav.Home ->
                [homePage model]
            Nav.Login ->
                [Authentication.loginView model.auth AuthMsg]
            Nav.Budget ->
                Budget.view model.budget BudgetMsg
            Nav.Expenses ->
                [text "Not Implemented"]

homePage : Model -> Html Msg
homePage model =
    text "Welcome to Bloomcraft"
    
modal : Model -> Html Msg
modal model =
    div [] []

        {--
              div [] [
                   ul [] (Nav.navLinks),
                   Authentication.accountView model.auth
                  ],
                  case model.page of
            
             ]
--}
decodeClick : msg -> Json.Decoder msg
decodeClick msg =
    Json.succeed msg
    

init : Navigation.Location -> (Model, Cmd Msg)
init location =
    let
        page = (Nav.urlChange location)
        (auth, authCmd) = Authentication.init
        (navbarState, navbarCmd) = Navbar.initialState NavMsg
              
    in
        ((Model 20 (easeMove 50 50 0 0) 0 0 False "" page auth Budget.init navbarState) !
             [case page of
                 Nav.Home -> Cmd.none
                 Nav.Login -> Cmd.none
                 Nav.Budget -> Debug.log "Loading Budget" Cmd.map BudgetMsg Budget.requestBudget
                 Nav.Expenses -> Cmd.none
             , Cmd.map AuthMsg authCmd, navbarCmd ]
        )

        
type Msg = Animate Time | ChangeValue Float | TimeMsg TimeMsg | RemoteUpdate String | LocationChange Nav.Page | AuthMsg Authentication.Msg | BudgetMsg Budget.Msg | NavMsg Navbar.State
    
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
            (startMove model newValue) ! [WebSocket.send "ws://echo.websocket.org" (toString newValue)]
        TimeMsg msg ->
            timeMsgUpdate msg model
        RemoteUpdate val ->
            { model | remoteVal = val } ! []
        LocationChange page -> {model | page = page} ! [
                                if page == Nav.Budget then
                                    Cmd.map BudgetMsg Budget.requestBudget
                                else
                                    Cmd.none
                               ]
        AuthMsg authMsg ->
            let
                (newAuthModel, authCmd) = Authentication.update authMsg model.auth
            in
                ({ model | auth = newAuthModel }, Cmd.map AuthMsg authCmd)
        BudgetMsg msg ->
            let
                (budget, cmd) = Budget.update model.budget msg
            in
                { model | budget = budget} ! [Cmd.map BudgetMsg cmd]
        NavMsg state ->
            ( { model | navbar = state }, Cmd.none )

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
