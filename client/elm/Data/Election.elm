module Data.Election exposing (Election, Ballot, Question, Candidate, decoder, encodeBallot)

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

type alias Election =
    { name : String
    , slug : Slug
    , detailText : String
    , questions : List Question
    }
    
type alias Ballot =
    { votes : List (Question, Candidate, Int)
    }

questionDecoder : Decoder Question
questionDecoder =
    decode Question
        |> required "name" string
        |> required "prompt" string
        |> required "candidates" (list string)
    
decoder : Decoder Election
decoder =
    decode Election
        |> required "name" string
        |> required "slug" (map Slug string)
        |> required "detailText" string
        |> required "questions" (list questionDecoder)

encodeBallot : Ballot -> Encode.Value
encodeBallot ballot =
    let
        encodeVote : (Question, Candidate, Int) -> Encode.Value
        encodeVote (question, candidate, score) =  Encode.object
                      [ "question" => Encode.string question.name
                      , "candidate" => Encode.string candidate
                      , "score" => Encode.int score
                      ]
        votes : Encode.Value
        votes = Encode.list (List.map encodeVote ballot.votes)
    in
        Encode.object
            [ "votes" => votes
            ]
