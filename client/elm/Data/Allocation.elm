module Data.Allocation exposing (Allocation, Expense, decoder)

import Json.Decode exposing (..)
import Json.Decode.Pipeline exposing (..)

type alias Allocation =
    { expenses : List Expense
    , amount : Int
    }

type alias Expense =
    { name : String
    , owner : String
    , requestedFunds : Int
    , currentAllocatedFunds : Int
    , newAllocatedFunds : Int
    }

decoder : Decoder Allocation
decoder =
    decode Allocation
        |> required "expenses" (list expenseDecoder)
        |> required "amount" int

expenseDecoder : Decoder Expense
expenseDecoder =
    decode Expense
        |> required "name" string
        |> required "owner" string
        |> required "requested_funds" int
        |> required "current_allocated_funds" int
        |> required "new_allocated_funds" int
