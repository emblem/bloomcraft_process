module Page.ScoreVote exposing (Model, Msg, init, update, view)

import Task exposing (Task)
import Html exposing (Html, text, h2, p, div)
import Html.Attributes exposing (colspan, class, style, for, href)
import Bootstrap.Grid as Grid
import Bootstrap.Grid.Col as Col
import Bootstrap.Form as Form
import Bootstrap.Form.Radio as Radio
import Bootstrap.Card as Card
import Bootstrap.Button as Button
import Bootstrap.Alert as Alert

import Http

import Data.Allocation as Allocation exposing (Slug)
import Data.Election exposing (Election, Ballot, BallotForm, Candidate, Vote, Question, VoteResponse, VoteReviewResponse, ElectionResponse)
import Page.Errored exposing (PageLoadError, pageLoadError)
import Request.Election
import View.Page as Page
import Data.Session exposing (Session)


type Model
    = Ballot BallotForm
    | Response VoteReviewResponse
    | ConfirmVote BallotForm
    | NotAllowed String       

type Msg
    = SubmitVote
    | CancelVote
    | ReviewVote
    | VoteResponse (Result Http.Error VoteResponse)
    | VoteConfirmResponse (Result Http.Error VoteReviewResponse)
    | UpdateScore Vote

init : Slug -> Task PageLoadError Model
init slug =
        let
        loadElection = Http.toTask (Request.Election.election slug)

        handleLoadError err =
            let
                l = Debug.log "Expense Load Err" err
            in
                pageLoadError (Page.Other) "Failed to load election"

        initModel : ElectionResponse -> Model
        initModel response =
            case response of
                Ok election ->
                    Ballot { election = election
                           , ballot = { votes = [] }
                           }
                Err reason ->
                    NotAllowed reason
    in
        Task.map initModel loadElection
            |> Task.mapError handleLoadError


view : Model -> Html Msg
view model =
    let
        content =
            case model of
                Ballot ballot -> electionView ballot
                Response response -> viewResponse response
                NotAllowed reason -> viewNotAllowed reason
                ConfirmVote ballot -> confirmView ballot
    in
        Grid.container []
            [ Grid.row []
                  [ Grid.col [ Col.xs10 ] [ content ]
                  ]
            ]
            
viewNotAllowed : String -> Html Msg
viewNotAllowed reason =
    viewCard "Sorry, you cannot vote at this time"
        (text reason)
        []

viewResponse : VoteReviewResponse -> Html Msg
viewResponse response =
    case response of
        Ok anon_id ->
            viewCard "Vote Submitted"
                (text "Your vote was received.  Please record your unique anonymous voter ID.  This is the only opportunity you will have to record this ID.  It cannot be retrieved later.")
                [ p [] [text ("Anonymous Voter ID:"), h2 [class "text-center"] [text anon_id]] ]
        Err error ->
            viewCard "Vote NOT Submitted"
                (text error)
                []
       
viewCard: String -> Html Msg -> List (Html Msg) -> Html Msg
viewCard title infobox content =
    Card.config [ Card.attrs [class "mt-2" ]]
        |> Card.headerH4 []
           [ text <| title ]
        |> Card.block []
           [ Card.custom <|
                 div [] ((Alert.info [infobox])::content)
           ]
        |> Card.view

confirmView : BallotForm -> Html Msg
confirmView ballotForm =
    viewCard "Confirm your vote."
        (div [] [ p [] [ text "Your ratings are shown below.  Please review them, then select an option below." ]
                , p [] [ text "One you submit your vote it cannot be altered." ]
                ]
        ) <|
        List.concat
            [ List.map voteView (List.sortBy (\v -> v.question ++ v.candidate) ballotForm.ballot.votes)
            , [ Button.button [Button.primary, Button.onClick SubmitVote] [ text "Submit Vote" ]
              , Button.button [Button.secondary, Button.onClick CancelVote] [ text "Change Vote" ]
              ]
            ]
        
voteView : Vote -> Html Msg
voteView vote =
    p [] [ text (vote.question ++ ": " ++ vote.candidate ++ ": " ++ toString vote.score) ]
            
electionView : BallotForm -> Html Msg
electionView ballotForm =
    Card.config [ Card.attrs [class "mt-2" ]]
        |> Card.headerH4 []
           [ text <| "Current Election: " ++ ballotForm.election.name ]
        |> Card.block []
           [ Card.custom <|
                 div []
                 [ Alert.info [text ballotForm.election.detailText]
                 , div [] (List.map (questionView ballotForm.ballot) ballotForm.election.questions)
                 , Button.button [Button.primary, Button.onClick ReviewVote] [ text "Review Vote" ]
                 ]                 
           ]

        |> Card.view


           
questionView : Ballot -> Question -> Html Msg
questionView ballot question =
    Card.config [ Card.attrs [class "mt-2" ]]
        |> Card.headerH4 []
           [ text ("Question: " ++ question.prompt) ]
        |> Card.block []
           [ Card.custom <| questionForm ballot question]
        |> Card.view

getScore: Ballot -> Question -> Candidate -> Int
getScore ballot question candidate =
    let
        votes : List Vote
        votes = List.filter (\v -> v.question == question.name && v.candidate == candidate) ballot.votes
    in
        Maybe.withDefault 0 (Maybe.map .score (List.head votes))
           
questionForm : Ballot -> Question -> Html Msg
questionForm ballot question =
    let
        scoreForCandidate c = getScore ballot question c
    in
        Form.form [] (List.map (\c -> candidateView question c (scoreForCandidate c)) question.candidates)

candidateView : Question -> Candidate -> Int -> Html Msg
candidateView question candidate defScore =                    
    Form.group []
        [ div [style [("border-width", "1px"), ("border-style", "solid")
                   , ("box-shadow", "2px 3px 6px 3px rgba(0,0,0,0.1)")], class "rounded p-1 mb-2" ]
            [ Form.row []
                  [ Form.col [ Col.xs3 ] [ div [class "text-right"] [Form.label [ for "score", class "btn text-right"] [ text candidate ] ] ]
                  , Form.col [ Col.xs9 ] [scoreRadios question candidate defScore]
                  ]              
            ]
        ]
            
scoreRadios : Question -> Candidate -> Int -> Html Msg
scoreRadios q c defScore =
    let
        makeRadio : Int -> Radio.Radio Msg
        makeRadio score = Radio.create [Radio.onClick (UpdateScore (Vote q.name c score)), Radio.inline, Radio.checked (score == defScore)] (toString score)

        radios : List (Radio.Radio Msg)
        radios = (List.map makeRadio (List.range 0 10))
    in
        div []
            (Radio.radioList ("score_radios" ++ q.name ++ c)  radios)            

        
update : Session -> Msg -> Model -> (Model, Cmd Msg)
update session msg model =
    let
        maybeToInt str = case str of
                             "" -> Nothing
                             _ -> Just (String.toInt str)

        intToPct val = ((toFloat val)/100)
                                  
        updateBallot : Vote -> Ballot -> Ballot
        updateBallot vote oldBallot =
            let
                notOldScore v = v.question /= vote.question || v.candidate /= vote.candidate
            in
                { oldBallot | votes =
                      vote :: List.filter notOldScore oldBallot.votes
                }

    in
        Debug.log (toString (model, msg)) <| case model of
            Ballot ballot ->
                case msg of
                    ReviewVote ->
                        (model, Http.send VoteResponse (Request.Election.postVote session ballot.ballot ballot.election.slug) )               
                    UpdateScore vote -> 
                        (Ballot {ballot | ballot = updateBallot vote ballot.ballot }, Cmd.none)
                    
                    VoteResponse (Ok response) -> case response of
                                                    Ok ballot -> (ConfirmVote ballot, Cmd.none)
                                                    Err reason -> (NotAllowed reason, Cmd.none)
                    VoteResponse (Err error) -> (NotAllowed ("Failed to submit vote: " ++ toString error) , Cmd.none)
                    _ -> (model, Cmd.none)
            
            Response _ -> (model, Cmd.none)

            ConfirmVote ballot ->
                case msg of
                    SubmitVote ->
                        (model, Http.send VoteConfirmResponse (Request.Election.confirmVote session ballot.election.slug) )
                    CancelVote ->
                        (Ballot ballot, Cmd.none)
                    VoteConfirmResponse (Ok response) -> (Response response, Cmd.none)
                    _ -> (model, Cmd.none)

            NotAllowed _ ->
                (model, Cmd.none)    
