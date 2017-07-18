module Data.Budget exposing (decoder, Budget, Lease)

import Json.Decode exposing (..)

type alias Budget =
    { coreExpenses : Float
    , leases : List (Lease)
    , leaseAdmin : Maybe String
    , leaseMember : List String
    }

type alias Lease =
    { currentRent : Float
    , proposedRent : Float
    , name : String
    , adminName : Maybe String
    }

    
decoder : Decoder Budget
decoder =
    let
        rent = Json.Decode.map4 Lease
               (field "current_rent" float)
               (field "proposed_rent" float)
               (field "name" string)
               (maybe <| field "admin_name" string)
    in
        Json.Decode.map4 Budget
            (field "core_expenses" float)
            (field "leases" (list rent))
            (maybe <| field "lease_admin" string)
            (field "lease_member" (list string))                
