module Page.Login exposing (Model, view, update, Msg, initialModel, OutMsg(..))

import Html exposing (Html, div, text, input, button)
import Html.Attributes exposing (type_, placeholder, value, class, for)
import Http
import Bootstrap.Card as Card
import Bootstrap.Form as Form
import Bootstrap.Form.Input as Input
import Bootstrap.Button as Button


import Data.Session exposing (Session)
import Request.User

type Msg
    = SetUsername String
    | SetPassword String
    | SubmitLogin
    | LoginResponse (Result Http.Error Session)
      
type OutMsg
    = SetSession Session
        
type alias Model =
    { username : String
    , password : String
    }

initialModel : Model
initialModel =
    { username = ""
    , password = ""
    }
    
view : Model -> Html Msg
view model =
    Card.config [ Card.attrs [class "m-4" ]]
        |> Card.headerH3 []
           [ text "Sign in to Bloomcraft Here!"
           ]
        |> Card.block []
           [ Card.custom <|
                 Form.form []
                     [ Form.group []
                       [ Form.label [ for "username" ] [ text "Username" ]
                       , Input.text [ Input.id "username", Input.onInput SetUsername ]
                       , Form.help [] [ text  "Check your email for a message with your username" ]
                       ]
                     , Form.group []
                       [ Form.label [ for "password" ] [ text "Password" ]
                       , Input.password [ Input.id "password", Input.onInput SetPassword ]
                       ]
                     , Button.button [ Button.primary, Button.onClick SubmitLogin ] [ text "Login" ]
                     ]
           ]
        |> Card.view
         
update : Msg -> Model -> (Model, Cmd Msg, Maybe OutMsg)
update msg model =
    case msg of
        SetPassword password -> ( {model | password = password}, Cmd.none, Nothing )

        SetUsername username -> ( {model | username = username}, Cmd.none, Nothing )

        SubmitLogin -> (model, Http.send LoginResponse (Request.User.login model.username "development"), Nothing)

        LoginResponse (Ok session) -> (model, Cmd.none, Just (SetSession session))

        LoginResponse (Err _) -> (model, Cmd.none, Nothing)                       