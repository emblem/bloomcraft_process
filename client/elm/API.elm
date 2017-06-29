module API exposing (..)

import Http exposing (..)
import Json.Decode exposing (Decoder, field)
import Json.Encode

type alias State a =
    { csrf_token : Maybe String
    , selfRoute : Msg a -> a
    }

init : (Msg a -> a) -> State a
init selfRouter = { csrf_token = Nothing
                  , selfRoute = selfRouter
                  }
    
    
type APIResponse = Success | Auth AuthResponse | Error

type alias RentChangeResponse = {}
type alias AuthResponse = { csrf_token : String, username : String }
    
type alias RequestParams a =
    { url : String
    , body : Body
    , decoder : Decoder APIResponse
    , responseRouter : (APIResponse -> a)
    }    
    
type Msg a = Post (RequestParams a) | NoOp | SetCSRF String

send : RequestParams a -> State a -> Cmd a
send params state =
    let
        request = Http.request
                  { method = "POST"
                  , headers = case state.csrf_token of
                                  Just token -> [Http.header "X-CSRFToken" token]
                                  Nothing -> []
                  , url = params.url
                  , body = params.body
                  , expect = expectJson params.decoder
                  , timeout = Nothing
                  , withCredentials = False
                  }
        handler = if params.url == "login.json" then
                      loginResponseHandler >> state.selfRoute
                  else
                      responseHandler >> params.responseRouter
    in
        Http.send handler request

responseHandler : Result Error APIResponse -> APIResponse
responseHandler result =
    Success

loginResponseHandler : Result Error APIResponse -> Msg a
loginResponseHandler result =
    case result of
        Ok response ->
            case response of
                Success -> NoOp
                Auth authResponse -> SetCSRF authResponse.csrf_token
                Error -> NoOp
        Err error ->
            Tuple.first (NoOp, Debug.log "Login Error" error)

update : Msg a-> State a -> (State a, Cmd a)
update msg state =
    case msg of
        Post params -> (state, send params state)
        NoOp -> (state, Cmd.none)
        SetCSRF token -> ({state | csrf_token = Just token}, Cmd.none)
        
changeRent : Int -> (APIResponse -> a) -> Msg a
changeRent rent responseRouter =
    let
        payload = Json.Encode.object [ ("new_rent", Json.Encode.int rent) ]
    in
        Post { url = "rent.json"
             , body = Http.jsonBody payload
             , decoder = rentChangeResponseDecoder
             , responseRouter = responseRouter
             }

login : String -> String -> (APIResponse -> a) -> Msg a
login username password responseRouter =
    Post { url = "login.json"
         , body = Http.jsonBody <| Json.Encode.object
                  [ ("username", Json.Encode.string username)
                  , ("password", Json.Encode.string password)
                  ]
         , decoder = loginResponseDecoder
         , responseRouter = responseRouter
         }

loginResponseDecoder : Json.Decode.Decoder APIResponse
loginResponseDecoder =
    Json.Decode.map Auth <|
        Json.Decode.map2 AuthResponse
        (field "csrf_token" Json.Decode.string)
        (field "username" Json.Decode.string)
            
rentChangeResponseDecoder : Decoder APIResponse
rentChangeResponseDecoder =
    Json.Decode.succeed Success
