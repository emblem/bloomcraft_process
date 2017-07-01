module Data.User exposing (..)

import Json.Decode as Decode exposing (Decoder)
import Json.Decode.Pipeline exposing (decode, required)

import Data.Token exposing (Token)

type alias User =
    { username : String
    , fullname : String
    , authToken : Maybe Token
    }

decoder : Decoder User
decoder =
    decode User
        |> required "username" Decode.string
        |> required "fullname" Decode.string
        |> required "auth_token" (Decode.nullable Data.Token.decoder)

