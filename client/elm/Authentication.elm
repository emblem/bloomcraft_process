module Authentication exposing (..)

import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (..)
import Http exposing (..)
import Json.Decode exposing (Decoder, string, field)
import API

type Msg = UserName String |
    Password String |
    Login |
    Logout |
    LoginResponse API.APIResponse |
    LoggedOut (Result Error String) |
    User (Result Error UserInfo)

type alias UserInfo = {
        username : String
    }
    
type alias Model a = {
        username : Maybe String,
        password : String,
        csrf_token : String,
        entered_username : String,
        selfRouter : (Msg -> a)
    }

init : (Msg -> a) -> (Model a, Cmd Msg)
init selfRouter = ((Model Nothing "" "" "" selfRouter), requestUser)
    
loginView : (Model a) -> (Msg -> a) -> Html a
loginView model msg =
    div [] [
         text "Bloomcraft Login",
         input [type_ "text", placeholder "Username", value model.entered_username, onInput (msg << UserName)] [],
         input [type_ "password", placeholder "Password", onInput (Password >> msg)] [],
         button [ onClick (msg Login) ] [ text "Login" ],
         button [ onClick (msg Logout) ] [ text "Logout" ]
        ]
         
update : Msg -> (Model a) -> (Model a, Cmd Msg, Maybe (API.Msg a))
update msg model =
    let
        newModel = case msg of        
                       Password password -> { model | password = password }
                       UserName username -> { model | entered_username = username }
                       _ -> model
        cmd = Cmd.none
        apiMsg = case msg of
                     Login -> Just <| API.login model.entered_username "development" (LoginResponse >> model.selfRouter)
                     _ -> Nothing
    in
        (newModel, cmd, apiMsg)

postLogoutRequest : Model a -> Cmd Msg
postLogoutRequest model =
    let
        request = Http.request {
                      method = "POST",
                      headers = [ Http.header "X-CSRFToken" model.csrf_token ],
                      url = "logout.json",
                      body = emptyBody,
                      expect = expectString,
                      timeout = Nothing,
                      withCredentials = False
                  }        
    in
        Http.send LoggedOut request

requestUser : Cmd Msg
requestUser =
    Http.send User <|
        Http.get "user.json" userDecoder

userDecoder : Decoder UserInfo
userDecoder =
    Json.Decode.map UserInfo (field "username" Json.Decode.string)

accountView : Model a -> Html b
accountView model =
    case model.username of
        Just user -> Html.text ("Hello, " ++ user)
        Nothing -> Html.text "Not logged in"
