module Authentication exposing (..)

import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (..)
import Http exposing (..)
import Json.Encode as JS

type AuthMsg = UserName String | Password String | Login

type alias AuthModel = {
        username : String,
        password : String
    }

initModel : AuthModel
initModel = (AuthModel "" "") 
    
loginView : (AuthMsg -> msg ) -> Html msg
loginView tagger =
    div [] [
         text "Bloomcraft Login",
         input [type_ "text", placeholder "", onInput (UserName >> tagger)] [],
         input [type_ "password", placeholder "Password", onInput (Password >> tagger)] [],
         button [ onClick (tagger Login) ] [ text "Login" ]
        ]
         
update : AuthMsg -> AuthModel -> (AuthModel, Cmd AuthMsg)
update msg model =
    case msg of
        Password password -> { model | password = password } ! []
        UserName username -> { model | username = username } ! []
        Login -> model ! [postLoginRequest model]


postLoginRequest : AuthModel -> Cmd AuthMsg
postLoginRequest =
    let
        body = multipart [
                [
                 stringData "username" (JS.encode model.username),
                 stringData "password" (JS.encode model.password)
                ]
               ]
    Http.post loginResponseDecoder "/login.json" body
