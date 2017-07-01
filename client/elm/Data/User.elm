module Data.User exposing (..)

import Json.Decode as Decode exposing (Decoder)
import Json.Decode.Pipeline exposing (decode, required)

type alias User =
    { username : String
    , fullname : String
    }

decoder : Decoder User
decoder =
    decode User
        |> required "username" Decode.string
        |> required "fullname" Decode.string
