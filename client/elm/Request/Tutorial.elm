module Request.Tutorial exposing (tutorial, help)

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

help : Http.Request (List (Tutorial a))
help =
    (apiUrl "/help.json")
        |> HttpBuilder.get
        |> HttpBuilder.withExpect (Http.expectJson (Decode.field "help" (Decode.list Tutorial.decoder)))
        |> HttpBuilder.toRequest
    
