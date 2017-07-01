module Data.Session exposing (..)

import Json.Decode as Decode exposing (Decoder, field)

import Data.User as User exposing (User)

type alias Session = Maybe User

decoder : Decoder Session
decoder =
    field "user" (Decode.nullable User.decoder)
