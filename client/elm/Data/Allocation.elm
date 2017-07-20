module Data.Allocation exposing (Allocation, Expense, Vote, decoder, expenseDecoder, voteDecoder, Slug, slugParser, slugToString, encodeVote)

import Json.Encode as Encode

import Json.Decode exposing (..)
import Json.Decode.Pipeline exposing (..)
import UrlParser

import Util exposing ((=>), encodeMaybe)

type alias Allocation =
    { expenses : List Expense
    , amount : Int
    , numVoters : Int
    , decisionDate : String
    }

type alias Expense =
    { name : String
    , owner : String
    , detailText : String
    , partialAllowed : Bool
    , excessAllowed : Bool
    , requestedFunds : Int
    , currentAllocatedFunds : Int
    , newAllocatedFunds : Int
    , userNewAllocatedFunds : Int
    , slug : Slug             
    }

type alias Vote =
    { weight : Int
    , rank : Int
    , personalMax : Maybe Int
    , personalPctMax : Maybe Float
    , globalMax : Maybe Int
    }

type Slug = Slug String

    
slugParser : UrlParser.Parser (Slug -> a) a
slugParser =
    UrlParser.custom "SLUG" (Ok << Slug)

slugToString : Slug -> String
slugToString (Slug slug) =
    slug

voteDecoder : Decoder Vote
voteDecoder =
    decode Vote
        |> required "weight" int
        |> required "rank" int
        |> required "personal_abs_max" (nullable int)
        |> required "personal_pct_max" (nullable float)
        |> required "global_abs_max" (nullable int)

encodeVote : Vote -> Encode.Value
encodeVote vote =
    let
        intMaybe = encodeMaybe Encode.int
        floatMaybe = encodeMaybe Encode.float
    in
        Encode.object
            [ "weight" => Encode.int vote.weight
            , "rank" => Encode.int vote.rank
            , "personal_abs_max" => intMaybe vote.personalMax
            , "global_abs_max" => intMaybe vote.globalMax
            , "personal_pct_max" => floatMaybe vote.personalPctMax
            ]
            
        
decoder : Decoder Allocation
decoder =
    decode Allocation
        |> required "expenses" (list expenseDecoder)
        |> required "amount" int
        |> required "num_voters" int
        |> required "decision_date" string

expenseDecoder : Decoder Expense
expenseDecoder =
    decode Expense
        |> required "name" string
        |> required "owner" string
        |> required "detail_text" string
        |> required "partial_allowed" bool
        |> required "excess_allowed" bool
        |> required "requested_funds" int
        |> required "current_allocated_funds" int
        |> required "new_allocated_funds" int
        |> required "user_new_allocated_funds" int
        |> required "slug" (map Slug string)
