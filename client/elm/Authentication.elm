module Authentication exposing (..)

import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (..)
import Http exposing (..)
import Json.Decode exposing (Decoder, string, field)
import Json.Encode exposing (object, string)

type Msg = UserName String |
    Password String |
    Login |
    Auth (Result Error AuthResponse ) |
    Logout |
    LoggedOut (Result Error String) |
    User (Result Error UserInfo)

type alias UserInfo = {
        username : String
    }

type alias AuthResponse = { csrf_token : String, username : String }
    
type alias Model = {
        username : Maybe String,
        password : String,
        csrf_token : String,
        entered_username : String
    }

init : (Model, Cmd Msg)
init  = ((Model Nothing "" "" ""), requestUser)
    
loginView : Model -> (Msg -> a) -> Html a
loginView model msg =
    div [] [
         text "Bloomcraft Login",
         input [type_ "text", placeholder "Username", value model.entered_username, onInput (msg << UserName)] [],
         input [type_ "password", placeholder "Password", onInput (Password >> msg)] [],
         button [ onClick (msg Login) ] [ text "Login" ],
         button [ onClick (msg Logout) ] [ text "Logout" ]
        ]
         
update : Msg -> Model -> (Model, Cmd Msg)
update msg model =
    case msg of
        Password password -> { model | password = password } ! []
        UserName username -> { model | entered_username = username } ! []
        Login -> model ! [postLoginRequest model]
        Logout -> model ! [postLogoutRequest model]
        Auth (Ok response) -> {model | csrf_token = response.csrf_token, username = Just response.username } ! []
        Auth (Result.Err error) -> (Debug.log ("Auth Failed:" ++ (toString error)) model) ! []
        LoggedOut _ -> (model, Cmd.none)
        User (Ok userInfo) -> {model | username = Just userInfo.username} ! []
        User (Result.Err error) -> (Debug.log ("Get User Failed: " ++ (toString error)) model) ! []


postLoginRequest : Model -> Cmd Msg
postLoginRequest model =
    let
        body = Http.jsonBody <|
               Json.Encode.object 
               [
                ("username", Json.Encode.string model.entered_username),
                ("password", Json.Encode.string "development")
               ]               
        request =  Http.post "login.json" body (loginResponseDecoder)
    in
        Http.send Auth request

loginResponseDecoder : Json.Decode.Decoder AuthResponse
loginResponseDecoder =
    Json.Decode.map2 AuthResponse
        (field "csrf_token" Json.Decode.string)
        (field "username" Json.Decode.string)

postLogoutRequest : Model -> Cmd Msg
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

accountView : Model -> Html a
accountView model =
    case model.username of
        Just user -> Html.text ("Hello, " ++ user)
        Nothing -> Html.text "Not logged in"
