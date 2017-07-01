module Page.Budget exposing (init, Model)

import Task exposing (Task)
import Time exposing (Time)
import Http

import Page.Errored exposing (pageLoadError, PageLoadError)
import View.Page as Page

import Request.Budget
import Data.Budget exposing (Budget, Lease)

type alias Model =
    { budget : Budget
    , requestedRent : Result String Int
    , time : Time
    , animations : List Animation
    }

type Animation = Animation (Time -> Budget -> Budget)

init : Task PageLoadError Model
init =
    let
        loadBudget = Http.toTask Request.Budget.budget

        handleLoadError _ =
            pageLoadError Page.Budget "Failed to load budget"

        initModel : Budget -> Time -> Model
        initModel budget time =
            { budget = budget
            , requestedRent = Err ""
            , time = time
            , animations = []
            }
            
    in
        Task.map2 initModel loadBudget Time.now
            |> Task.mapError handleLoadError

