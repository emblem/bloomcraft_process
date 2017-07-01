module Request.User exposing (login)

import Http
import HttpBuilder
import Json.Encode as Encode

import Util exposing ((=>))

import Data.Session as Session exposing (Session)
import Request.Helpers exposing (apiUrl)


login : String -> String -> Http.Request Session
login username password =
    let
        credentials =
            Encode.object
                [ "username" => Encode.string username
                , "password" => Encode.string password
                ]

        body =
            Encode.object [ "credentials" => credentials ]
    in
        apiUrl "/login.json"
            |> HttpBuilder.post
            |> HttpBuilder.withExpect (Http.expectJson (Session.decoder))
            |> HttpBuilder.withJsonBody body
            |> HttpBuilder.toRequest
