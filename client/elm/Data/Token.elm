module Data.Token exposing (..)

import Json.Decode as Decode exposing (Decoder)
import HttpBuilder exposing (RequestBuilder, withHeader)

type Token = Token String


decoder : Decoder Token
decoder =
    Decode.map Token Decode.string

withAuthorization : Maybe Token -> RequestBuilder a -> RequestBuilder a
withAuthorization maybeToken builder =
    case maybeToken of
        Just (Token token) ->
            builder
                |> withHeader "X-CSRFToken" token

        Nothing ->
            builder
