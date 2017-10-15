module Request.Election exposing (election, postVote)

import Http
import HttpBuilder
import Json.Decode as Decode
import Json.Encode as Encode

import Data.Election as Election exposing (Election, Ballot, encodeBallot)
import Request.Helpers exposing (apiUrl)
import Data.Session as Session exposing (..)
import Data.Allocation exposing (slugToString, Slug)
import Util exposing ((=>))

election : Slug -> Http.Request Election
election slug =
    (apiUrl ("/election/" ++ slugToString slug ++ "/vote.json"))
        |> HttpBuilder.get
        |> HttpBuilder.withExpect (Http.expectJson (Decode.field "election" Election.decoder))
        |> HttpBuilder.toRequest
                   
postVote : Session -> Ballot -> Slug -> Http.Request String
postVote session ballot slug =
    let
        ballotJson : Encode.Value
        ballotJson = encodeBallot ballot

        body : Encode.Value
        body = Encode.object [ "ballot" => ballotJson ]
    in
        (apiUrl ("/election/" ++ slugToString slug ++ "/vote.json"))
            |> HttpBuilder.post
            |> HttpBuilder.withExpect (Http.expectJson <| Decode.field "result" Decode.string)
            |> HttpBuilder.withJsonBody body
            |> withAuthorization session
            |> HttpBuilder.toRequest
