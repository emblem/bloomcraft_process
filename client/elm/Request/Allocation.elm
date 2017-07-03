module Request.Allocation exposing (allocation)

import Http
import HttpBuilder
import Json.Decode as Decode

import Data.Allocation as Allocation exposing (Allocation, Expense)
import Request.Helpers exposing (apiUrl)

allocation : Http.Request Allocation
allocation =
    (apiUrl "/allocation.json")
        |> HttpBuilder.get
        |> HttpBuilder.withExpect (Http.expectJson (Decode.field "allocation" Allocation.decoder))
        |> HttpBuilder.toRequest
