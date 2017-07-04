module Data.Tutorial exposing (Tutorial, decoder)

import Html exposing (Html)

import Markdown

import Json.Decode exposing (..)
import Json.Decode.Pipeline exposing (..)

type alias Tutorial msg =
    { header : String
    , body : Html msg
    }

decoder : Decoder (Tutorial msg)
decoder =
    decode Tutorial
        |> required "header" string
        |> required "body" (map (Markdown.toHtml []) string)                     
