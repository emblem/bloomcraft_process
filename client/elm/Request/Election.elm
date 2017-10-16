module Request.Election exposing (election, postVote, confirmVote)

import Http
import HttpBuilder
import Json.Encode as Encode

import Data.Election as Election exposing (Election, Ballot, encodeBallot, voteResponseDecoder, VoteResponse, VoteReviewResponse, ElectionResponse, voteConfirmDecoder)
import Request.Helpers exposing (apiUrl)
import Data.Session as Session exposing (..)
import Data.Allocation exposing (slugToString, Slug)
import Util exposing ((=>))

election : Slug -> Http.Request ElectionResponse
election slug =
    (apiUrl ("/election/" ++ slugToString slug ++ "/vote.json"))
        |> HttpBuilder.get
        |> HttpBuilder.withExpect (Http.expectJson (Election.electionResponseDecoder))
        |> HttpBuilder.toRequest
                   
postVote : Session -> Ballot -> Slug -> Http.Request VoteResponse
postVote session ballot slug =
    let
        ballotJson : Encode.Value
        ballotJson = encodeBallot ballot

        body : Encode.Value
        body = Encode.object [ "ballot" => ballotJson ]
    in
        (apiUrl ("/election/" ++ slugToString slug ++ "/vote.json"))
            |> HttpBuilder.post
            |> HttpBuilder.withExpect (Http.expectJson <| voteResponseDecoder )
            |> HttpBuilder.withJsonBody body
            |> withAuthorization session
            |> HttpBuilder.toRequest


confirmVote : Session -> Slug -> Http.Request VoteReviewResponse
confirmVote session slug =
    let
        body : Encode.Value
        body = Encode.object [ "submit" => Encode.string "confirmed" ]
    in
        (apiUrl ("/election/" ++ slugToString slug ++ "/vote.json"))
            |> HttpBuilder.post
            |> HttpBuilder.withExpect (Http.expectJson <| voteConfirmDecoder )
            |> HttpBuilder.withJsonBody body
            |> withAuthorization session
            |> HttpBuilder.toRequest
             
