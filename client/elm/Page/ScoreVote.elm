module Page.ScoreVote exposing (Model, Msg, init, update, view)

import Task exposing (Task)
import Html exposing (Html, text, h2, p, div)
import Html.Attributes exposing (colspan, class, style, for, href)
import Bootstrap.Grid as Grid
import Bootstrap.Grid.Col as Col
import Bootstrap.Form as Form
import Bootstrap.Form.Input as Input
import Bootstrap.Card as Card
import Bootstrap.Button as Button
import Bootstrap.Alert as Alert

import Http

import Data.Allocation as Allocation exposing (Slug)
import Data.Election exposing (Election, Ballot, Candidate, Question)
import Page.Errored exposing (PageLoadError, pageLoadError)
import Request.Election
import View.Page as Page
import Data.Session exposing (Session)


type alias Model =
    { election : Election
    , ballot : Ballot
    }

type Msg
    = SubmitVote
    | VoteResponse (Result Http.Error String)
    | UpdateScore Question Candidate String

init : Slug -> Task PageLoadError Model
init slug =
        let
        loadElection = Http.toTask (Request.Election.election slug)

        handleLoadError err =
            let
                l = Debug.log "Expense Load Err" err
            in
                pageLoadError (Page.Other) "Failed to load election"

        initModel : Election -> Model
        initModel election =
            { election = election
            , ballot = { votes = [] }
            }            
    in
        Task.map initModel loadElection
            |> Task.mapError handleLoadError


view : Model -> Html Msg
view model =
    let
        election = model.election
    in
        Grid.container []
            [ Grid.row []
                  [ Grid.col [ Col.lg8 ] [ electionView election ]
                  ]
            ]

electionView : Election -> Html Msg
electionView election =
    Card.config [ Card.attrs [class "mt-2" ]]
        |> Card.headerH4 []
           [ text <| "Current Election: " ++ election.name ]
        |> Card.block []
           [ Card.custom <|
                 div []
                 [ Alert.info [text election.detailText]
                 , div [] (List.map questionView election.questions)
                 , Button.button [Button.primary, Button.onClick SubmitVote] [ text "Vote" ]
                 ]                 
           ]

        |> Card.view


           
questionView : Question -> Html Msg
questionView model =
    Card.config [ Card.attrs [class "mt-2" ]]
        |> Card.headerH4 []
           [ text ("Question: " ++ model.prompt) ]
        |> Card.block []
           [ Card.custom <| questionForm model]
        |> Card.view

questionForm : Question -> Html Msg
questionForm model =
    Form.form [] (List.map (candidateView model) model.candidates)

candidateView : Question -> Candidate -> Html Msg
candidateView question model =                    
    Form.group []
        [ Form.label [ for "score" ] [ text model ]
        , Input.number [ Input.id "score", Input.onInput (UpdateScore question model), Input.defaultValue "0" ]
        , Form.help [] [ text  "Rate this candidate using a whole number between 0 and 10." ]
        , case Nothing of
              Just str -> Form.validationText [] [ text str ]
              Nothing -> Form.validationText [] []
        ]
            
            
update : Session -> Msg -> Model -> (Model, Cmd Msg)
update session msg model =
    let
        maybeToInt str = case str of
                             "" -> Nothing
                             _ -> Just (String.toInt str)

        intToPct val = ((toFloat val)/100)
                                  
        updateBallot : (Question, Candidate, Int) -> Ballot -> Ballot
        updateBallot (question, candidate, score) oldBallot =
            let
                notOldScore (q,c,s) = q.name /= question.name || c /= candidate
            in
                { oldBallot | votes =
                      (question, candidate, score) :: List.filter notOldScore oldBallot.votes
                }

    in
        case msg of
            SubmitVote ->
                (model, Http.send VoteResponse (Request.Election.postVote session model.ballot model.election.slug) )
                    
            UpdateScore q c scoreStr -> case String.toInt scoreStr of
                                              Ok score -> ({model | ballot = updateBallot (q,c,score) model.ballot }, Cmd.none)
                                              Err _ -> (model, Cmd.none)
                    
            VoteResponse (Ok _) -> (model, Cmd.none)
            VoteResponse (Err _) -> (model, Cmd.none)
