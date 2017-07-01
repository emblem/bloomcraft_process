module Session exposing (..)

import Http exposing (..)

getToken : Http.Request Token
getToken =
    Http.get (apiUrl "/session.json") Token.decoder 
