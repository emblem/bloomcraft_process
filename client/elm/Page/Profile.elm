module Page.Profile exposing (init, view, update, Msg, Model, OutMsg(..))

import Http
import Html exposing (Html, text)
import Bootstrap.Grid as Grid
import Bootstrap.Grid.Col as Col
import Bootstrap.Button as Button

import Data.Session exposing (Session)
import Request.User

type alias Model = ()

type Msg
    = Logout
    | LoggedOut (Result Http.Error Session)

type OutMsg = SetSession Session

init : Model
init = ()

view : Session -> Model -> Html Msg
view session model =
    Grid.row []
        [ Grid.col [ Col.md8 ]
              [ Button.button [Button.warning, Button.onClick Logout] [ text "Sign out" ] ]
        ]
        
update : Session -> Msg -> Model -> (Model, Cmd Msg, Maybe OutMsg)
update session msg model =
    case msg of
        Logout ->
            (model, Http.send LoggedOut (Request.User.logout session), Nothing)
        LoggedOut (Ok session) ->
            (model, Cmd.none, Just (SetSession session))
        LoggedOut (Err _) ->
            (model, Cmd.none, Nothing)
