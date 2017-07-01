module Main exposing (main)

import Bootstrap.Navbar as Navbar
import Data.Session exposing (Session)
import Html exposing (Html)
import Http exposing (send)
import Navigation exposing (Location)
import Page.Budget as Budget
import Page.Errored as Errored exposing (PageLoadError, pageLoadError)
import Page.Home as Home
import Page.Login as Login
import Request.Session
import Route exposing (Route)
import Task
import Util exposing ((=>))
import View.Page as Page exposing (ActivePage)


type Page
    = Blank
    | NotFound
    | Errored PageLoadError
    | Home Home.Model
    | Login Login.Model
    | Budget Budget.Model
    | Expense

type PageState
    = Loaded Page
    | TransitioningFrom Page

type alias Model =
    { session : Session
    , pageState : PageState
    , navState : Navbar.State
    }

init : Location -> (Model, Cmd Msg)
init location =
    let
        (navState, navCmd) = Navbar.initialState NavMsg
        (model, cmd) = setRoute (Route.fromLocation location)
                       { pageState = Loaded Blank
                       , session = { user = Nothing, authToken = Nothing }
                       , navState = navState
                       }
    in
        model ! [cmd, Http.send SetSession Request.Session.getSession, navCmd]


getPage : PageState -> Page
getPage pageState =
    case pageState of
        Loaded page ->
            page

        TransitioningFrom page ->
            page
            
-- VIEW --

view : Model -> Html Msg
view model =
    case model.pageState of
        Loaded page ->
            viewPage model False page
                
        TransitioningFrom page ->
            viewPage model True page

viewPage : Model -> Bool -> Page -> Html Msg
viewPage model isLoading page =
    let
        session = model.session
        frame =
            Page.frame NavMsg model.navState isLoading session
    in
        case page of
            Errored subModel ->
                Errored.view session subModel
                    |> frame Page.Other
                       
            Home subModel ->
                Home.view session subModel |> frame Page.Home

            Budget subModel ->
                Budget.view session subModel
                    |> Html.map BudgetMsg
                    |> frame Page.Budget
                                               
            Login subModel ->
                Login.view subModel
                    |> Html.map LoginMsg
                    |> frame Page.Login
                       
            _ -> Html.text "Unsupported View" |> frame Page.Other


subscriptions : Model -> Sub Msg
subscriptions model =
    case model.pageState of
        Loaded (Budget subModel) ->
            Budget.subscriptions subModel |> Sub.map BudgetMsg
                
        _ -> Sub.none                
    
-- UPDATE --

type Msg
    = SetSession (Result Http.Error Session)
    | SetRoute (Maybe Route)
    | BudgetLoaded (Result PageLoadError Budget.Model)
    | NavMsg Navbar.State
    | BudgetMsg Budget.Msg
    | LoginMsg Login.Msg


setRoute : Maybe Route -> Model -> (Model, Cmd Msg)
setRoute maybeRoute model =
    let
        transition toMsg task =
            { model | pageState = TransitioningFrom (getPage model.pageState) }
                => Task.attempt toMsg task

        errored =
            pageErrored model

    in
        case maybeRoute of
            Nothing -> { model | pageState = Loaded NotFound } => Cmd.none
            Just Route.Home ->
                { model | pageState = Loaded (Home Home.initialModel) } => Cmd.none
            Just Route.Budget ->
                transition BudgetLoaded Budget.init
            Just Route.Expense ->
                errored Page.Expense "Expense isn't working yet, sorry!"
            Just Route.Login ->
                { model | pageState = Loaded (Login Login.initialModel) } => Cmd.none
            Just Route.Profile ->
                errored Page.Other "Profile doesn't work yet."

pageErrored : Model -> ActivePage -> String -> ( Model, Cmd msg )
pageErrored model activePage errorMessage =
    let
        error = Errored.pageLoadError activePage errorMessage
    in
        { model | pageState = Loaded (Errored error) } => Cmd.none
                
update : Msg -> Model -> (Model, Cmd Msg)
update msg model =
    updatePage (getPage model.pageState) msg model

    
updatePage : Page -> Msg -> Model -> ( Model, Cmd Msg )
updatePage page msg model =
    let
        session =
            model.session
                
        toPage toModel toMsg subUpdate subMsg subModel =
            let
                ( newModel, newCmd ) = subUpdate subMsg subModel
            in
                ( { model | pageState = Loaded (toModel newModel) }, Cmd.map toMsg newCmd )

        toPageWithOut toModel toMsg subUpdate subMsg subModel =
            let
                ( newModel, newCmd, outMsg ) = subUpdate subMsg subModel
            in
                ( { model | pageState = Loaded (toModel newModel) }, Cmd.map toMsg newCmd, outMsg )                    
    in
        case (msg, page) of
            (SetRoute route, _) ->
                setRoute route model
                    
            (SetSession (Ok session), _) ->
                let
                    cmd = if session.user /= model.session.user && session.user == Nothing then
                              Route.modifyUrl Route.Home
                          else
                              Cmd.none
                in
                    { model | session = session } => cmd
                        
            (SetSession (Err err), _) ->
                Tuple.first (pageErrored model Page.Home "Failed to get session state from server", Debug.log "Load Error: " err)
                              
            (BudgetLoaded (Ok subModel), _) ->
                { model | pageState = Loaded (Budget subModel) } => Cmd.none
                    
            (BudgetLoaded (Err error), _) ->
                { model | pageState = Loaded (Errored error) } => Cmd.none

            (NavMsg navState, _) ->
                { model | navState = navState } => Cmd.none

            (BudgetMsg subMsg, Budget subModel) ->
                toPage Budget BudgetMsg (Budget.update session) subMsg subModel

            (LoginMsg subMsg, Login subModel) ->
                let
                    (newModel, cmd, outMsg) = toPageWithOut Login LoginMsg Login.update subMsg subModel
                in
                    case outMsg of
                        Just (Login.SetSession newSession) -> ( {newModel | session = newSession}, Cmd.none )

                        Nothing -> (newModel, cmd)
                        
            --(_, NotFound) ->
            --  model => Cmd.none
                    
            (_, _) ->
                model => Cmd.none

-- MAIN --


main : Program Never Model Msg
main =
    Navigation.program (Route.fromLocation >> SetRoute)
        { init = init
        , view = view
        , update = update
        , subscriptions = subscriptions
        }
