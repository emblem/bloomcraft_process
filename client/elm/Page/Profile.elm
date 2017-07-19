module Page.Profile exposing (init, view, update, Msg, Model, OutMsg(..))

import Http
import Html exposing (Html, text, div, a, p, span)
import Html.Attributes exposing (class, href)
import Bootstrap.Grid as Grid
import Bootstrap.Grid.Col as Col
import Bootstrap.Button as Button

import Data.Session exposing (Session)
import Data.User exposing (User)
import Request.User

type alias Model = ()

type Msg
    = Logout
    | LoggedOut (Result Http.Error Session)

type OutMsg = SetSession Session

init : Model
init = ()

view : User -> Model -> Html Msg
view user model =
    Grid.container [] [
    Grid.row []
        [ Grid.col [ Col.md10 ]              
              [ p [] [ text "Your Profile Information:" ]
              , p []
                    [ span [class "muted"] [ text "Name: " ]
                    , span [class "lead"] [ text user.fullname ]
                    ]
              , p []
                  [ span [class "muted"] [ text "Email Address: " ]
                  , span [class "lead"] [ text user.username ]
                  ]
              , div [ class "text-center mt-4" ]
                  [ Button.linkButton [ Button.secondary, Button.attrs [ href "/process/accounts/password/change" ] ] [ text "Change Password" ]
                  ]
              , div [ class "text-center mt-4" ]
                  [ Button.button [Button.warning, Button.onClick Logout] [ text "Sign out" ]
                  ]
              ]
        ]
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
