module Data.Session exposing (..)

import Json.Decode as Decode exposing (Decoder, field)
import HttpBuilder exposing (RequestBuilder, withHeader)

import Data.User as User exposing (User)
import Data.Token as Token exposing (Token(..))

type alias Session =
    { user : Maybe User
    , authToken : Maybe Token
    }

decoder : Decoder Session
decoder =
    Decode.map2 Session
        (field "user" (Decode.nullable User.decoder))
        (Decode.map Just (field "auth_token" (Token.decoder)))

withAuthorization : Session -> RequestBuilder a -> RequestBuilder a
withAuthorization session builder =
    case session.authToken of
        Just (Token token) ->
            builder |> withHeader "X-CSRFToken" token
        Nothing ->
            builder
