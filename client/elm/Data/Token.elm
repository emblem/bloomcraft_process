module Data.Token exposing (..)

import Json.Decode as Decode exposing (Decoder)

type Token = Token String

decoder : Decoder Token
decoder =
    Decode.map Token Decode.string
