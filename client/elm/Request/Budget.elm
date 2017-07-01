module Request.Budget exposing (budget, changeRent)

import Http
import HttpBuilder
import Json.Decode as Decode
import Json.Encode as Encode

import Data.Budget as Budget exposing (Budget)
import Data.Session as Session exposing (withAuthorization, Session)

import Request.Helpers exposing (apiUrl)
import Util exposing ((=>))


budget : Http.Request Budget
budget =
    (apiUrl "/budget.json")
        |> HttpBuilder.get
        |> HttpBuilder.withExpect (Http.expectJson (Decode.field "budget" Budget.decoder))
        |> HttpBuilder.toRequest

changeRent : Int -> Session -> Http.Request ()
changeRent newRent session =
    let
        body = Encode.object ["new_rent" => Encode.int newRent]
    in
        (apiUrl "/rent.json")
            |> HttpBuilder.post
            |> HttpBuilder.withJsonBody body
            |> HttpBuilder.withExpect (Http.expectJson (Decode.succeed ()))
            |> withAuthorization session           
            |> HttpBuilder.toRequest
