module Data.Election exposing (Election, Ballot, BallotForm, Question, Candidate, decoder, encodeBallot,
                                   voteResponseDecoder, VoteResponse, VoteReviewResponse, Vote,
                                   ElectionResponse, electionResponseDecoder, voteConfirmDecoder)

import Json.Encode as Encode

import Json.Decode exposing (..)
import Json.Decode.Pipeline exposing (..)
import Data.Allocation exposing (Slug(..))

import Util exposing ((=>), encodeMaybe)

type alias Candidate = String

type alias Question =
    { name : String
    , prompt : String
    , candidates : List Candidate
    }          

type alias ElectionResponse = Result String Election
    
type alias Election =
    { name : String
    , slug : Slug
    , detailText : String
    , questions : List Question
    }

type alias Vote =
    { question : String
    , candidate : String
    , score : Int }
    
type alias Ballot =
    { votes : List Vote
    }

type alias BallotForm =
    { election : Election
    , ballot : Ballot
    }
    
type alias VoteReviewResponse = Result String String
type alias VoteResponse = Result String BallotForm
    
questionDecoder : Decoder Question
questionDecoder =
    decode Question
        |> required "name" string
        |> required "prompt" string
        |> required "candidates" (list string)

voteResponseDecoder : Decoder VoteResponse
voteResponseDecoder =
    let
        decodeResponse status =
            case status of
                "success" ->
                    map Ok (map2 BallotForm (field "election" decoder) (field "ballot" ballotDecoder))
                "error" ->
                    map Err (field "reason" string)
                _ ->
                    fail <| "Unknown status code: " ++ status
    in
        field "status" string
            |> andThen decodeResponse

voteConfirmDecoder : Decoder VoteReviewResponse
voteConfirmDecoder =
    let
        decodeResponse status =
            case status of
                "success" ->
                    map Ok (field "anon_id" string)
                "error" ->
                    map Err (field "reason" string)
                _ ->
                    fail <| "Unknown status code: " ++ status
    in
        field "status" string
            |> andThen decodeResponse

               
electionResponseDecoder : Decoder ElectionResponse
electionResponseDecoder =
    let
        decodeResponse status =
            case status of
                "success" ->
                    map Ok (field "election" decoder)
                "not_allowed" ->
                    map Err (field "reason" string)
                _ ->
                    fail <| "Unknown status code: " ++ status
    in
        field "status" string
            |> andThen decodeResponse
    
decoder : Decoder Election
decoder =
    decode Election
        |> required "name" string
        |> required "slug" (map Slug string)
        |> required "detail_text" string
        |> required "questions" (list questionDecoder)

encodeBallot : Ballot -> Encode.Value
encodeBallot ballot =
    let
        encodeVote : Vote -> Encode.Value
        encodeVote vote =  Encode.object
                      [ "question" => Encode.string vote.question
                      , "candidate" => Encode.string vote.candidate
                      , "score" => Encode.int vote.score
                      ]
        votes : Encode.Value
        votes = Encode.list (List.map encodeVote ballot.votes)
    in
        Encode.object
            [ "votes" => votes
            ]

ballotDecoder : Decoder Ballot
ballotDecoder =
    let
        voteDecoder = decode Vote
                    |> required "question" string
                    |> required "candidate" string
                    |> required "score" int
    in
        map Ballot (list voteDecoder)
