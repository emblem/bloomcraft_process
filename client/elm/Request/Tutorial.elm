module Request.Tutorial exposing (tutorial)

import Http
import HttpBuilder
import Json.Decode as Decode

import Data.Tutorial as Tutorial exposing (Tutorial)
import Request.Helpers exposing (apiUrl)
import Route exposing (Route)

tutorial : Route -> Http.Request (Maybe (Tutorial a))
tutorial route =
    (apiUrl "/tutorial.json")
        |> HttpBuilder.get
        |> HttpBuilder.withQueryParams [("route", Route.routeToString route)]
        |> HttpBuilder.withExpect (Http.expectJson (Decode.field "tutorial" (Decode.nullable Tutorial.decoder)))
        |> HttpBuilder.toRequest
