module Page.Login exposing (Model, view, update, Msg, initialModel, OutMsg(..))

import Html exposing (Html, div, text, input, button)
import Html.Attributes exposing (type_, placeholder, value)
import Html.Events exposing (onInput, onClick)
import Http

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
    div [] [
         text "Bloomcraft Login",
         input [type_ "text", placeholder "Username", onInput SetUsername] [],
         input [type_ "password", placeholder "Password", onInput SetPassword] [],
         button [ onClick SubmitLogin ] [ text "Login" ]
        ]
         
update : Msg -> Model -> (Model, Cmd Msg, Maybe OutMsg)
update msg model =
    case msg of
        SetPassword password -> ( {model | password = password}, Cmd.none, Nothing )

        SetUsername username -> ( {model | username = username}, Cmd.none, Nothing )

        SubmitLogin -> (model, Http.send LoginResponse (Request.User.login model.username "development"), Nothing)

        LoginResponse (Ok session) -> (model, Cmd.none, Just (SetSession session))

        LoginResponse (Err _) -> (model, Cmd.none, Nothing)                       
