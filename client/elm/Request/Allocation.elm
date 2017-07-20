module Request.Allocation exposing (allocation, expense, vote, postVote, votes, deleteVote)

import Http
import HttpBuilder
import Json.Decode as Decode
import Json.Encode as Encode

import Data.Allocation as Allocation exposing (Allocation, Expense, Vote, encodeVote)
import Request.Helpers exposing (apiUrl)
import Data.Session as Session exposing (..)
import Util exposing ((=>))

allocation : Http.Request Allocation
allocation =
    (apiUrl "/allocation.json")
        |> HttpBuilder.get
        |> HttpBuilder.withExpect (Http.expectJson (Decode.field "allocation" Allocation.decoder))
        |> HttpBuilder.toRequest

expense : Allocation.Slug -> Http.Request (Bool, Expense)
expense slug =
    let
        decoder = Decode.map2 (,)
                  (Decode.field "user_is_owner" Decode.bool)
                  (Decode.field "expense" Allocation.expenseDecoder)
    in
        (apiUrl ("/expenses/" ++ Allocation.slugToString slug ++ "/expense.json"))
            |> HttpBuilder.get
            |> HttpBuilder.withExpect (Http.expectJson decoder)
            |> HttpBuilder.toRequest

vote : Allocation.Slug -> Http.Request (Maybe Vote)
vote slug =
    (apiUrl ("/expenses/" ++ Allocation.slugToString slug ++ "/vote.json"))
        |> HttpBuilder.get
        |> HttpBuilder.withExpect (Http.expectJson (Decode.field "vote" (Decode.nullable Allocation.voteDecoder)))
        |> HttpBuilder.toRequest

deleteVote : Session -> Allocation.Slug -> Http.Request String
deleteVote session slug =
    (apiUrl ("/expenses/" ++ Allocation.slugToString slug ++ "/vote.json"))
        |> HttpBuilder.delete
        |> HttpBuilder.withExpect (Http.expectJson <| Decode.field "result" Decode.string)
        |> withAuthorization session
        |> HttpBuilder.toRequest

votes : Http.Request (List (Expense, Maybe(Vote)))
votes =
    let
        decoder = Decode.map2 (,) (Decode.field "expense" Allocation.expenseDecoder)
                  (Decode.field "vote" <| Decode.nullable Allocation.voteDecoder)
    in
        (apiUrl "/votes.json")
            |> HttpBuilder.get
            |> HttpBuilder.withExpect (Http.expectJson (Decode.field "votes" (Decode.list decoder)))
            |> HttpBuilder.toRequest
    
               
postVote : Session -> Vote -> Allocation.Slug -> Http.Request String
postVote session vote slug =
    let
        voteJson : Encode.Value
        voteJson = encodeVote vote

        body : Encode.Value
        body = Encode.object [ "vote" => voteJson ]
    in
        (apiUrl ("/expenses/" ++ Allocation.slugToString slug ++ "/vote.json"))
            |> HttpBuilder.post
            |> HttpBuilder.withExpect (Http.expectJson <| Decode.field "result" Decode.string)
            |> HttpBuilder.withJsonBody body
            |> withAuthorization session
            |> HttpBuilder.toRequest
