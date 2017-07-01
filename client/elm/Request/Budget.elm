module Request.Budget exposing (budget)

import Http
import HttpBuilder
import Json.Decode as Decode

import Data.Budget as Budget exposing (Budget)
import Request.Helpers exposing (apiUrl)


budget : Http.Request Budget
budget =
    (apiUrl "/budget.json")
        |> HttpBuilder.get
        |> HttpBuilder.withExpect (Http.expectJson (Decode.field "budget" Budget.decoder))
        |> HttpBuilder.toRequest
