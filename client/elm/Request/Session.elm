module Request.Session exposing (..)

import Http exposing (..)

import Data.Session exposing (Session)
import Request.Helpers exposing (..)

getSession : Http.Request Session
getSession =
    Http.get (apiUrl "/session.json") Data.Session.decoder
