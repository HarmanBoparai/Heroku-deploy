import React, { useState, useEffect } from "react";
import {
  Jumbotron,
  Container,
  CardColumns,
  Card,
  Button,
} from "react-bootstrap";

import Auth from "../utils/auth";
import { removeFundraiserId } from "../utils/localStorage";
import { useQuery, useMutation, useLazyQuery } from "@apollo/client";
import { GET_ME } from "../utils/queries";
import { REMOVE_FUNDRAISER } from "../utils/mutations";

const CreatedFundraiser = () => {
  const [userData, setUserData] = useState({});
  const { loading } = useQuery(GET_ME, {
    onCompleted: (dt) => {
      setUserData(dt.me);
    },
  });

  const [removeFundraiser, { removeFundraiserError, removeFundraiserData }] =
    useMutation(REMOVE_FUNDRAISER);
  if (!Auth.loggedIn()) {
    return <h1>Please login to save the fundraiser</h1>;
  }

  // if data isn't here yet, say so
  if (loading) {
    return <h2>LOADING...</h2>;
  }

  // use this to determine if `useEffect()` hook needs to run again
  const userDataLength = Object.keys(userData).length;

  // create function that accepts the fundraiser's mongo _id value as param and deletes the fundraiser from the database
  const handleDeleteFundraiser = async (fundraiserId) => {
    const token = Auth.loggedIn() ? Auth.getToken() : null;

    if (!token) {
      return false;
    }

    try {
      const { data } = await removeFundraiser({
        variables: { fundraiserId: fundraiserId },
      });

      console.log("remove fundraiser", data);
      setUserData(data.removeFundraiser);
      removeFundraiserId(fundraiserId);
    } catch (err) {
      console.error(err);
    }
  };
  // If data isn't here yet, say so
  if (!userDataLength) {
    return <h2>LOADING...</h2>;
  }
  return (
    <>
      <Jumbotron fluid className="text-light bg-dark">
        <Container>
          <h1>Viewing saved fundraisers!</h1>
        </Container>
      </Jumbotron>
      <Container>
        <h2>
          {userData.savedFundraisers.length
            ? `Viewing ${userData.savedFundraisers.length} saved ${
                userData.savedFundraisers.length === 1
                  ? "fundraiser"
                  : "fundraisers"
              }:`
            : "You have no saved fundraisers!"}
        </h2>
        <CardColumns>
          {userData.savedFundraisers.map((fundraiser) => {
            return (
              <Card key={fundraiser.fundraiserId} border="dark">
                {fundraiser.image ? (
                  <Card.Img
                    src={fundraiser.image}
                    alt={`The cover for ${fundraiser.title}`}
                    variant="top"
                  />
                ) : null}
                <Card.Body>
                  <Card.Title>{fundraiser.title}</Card.Title>
                  <p className="small">Poster: {fundraiser.poster}</p>
                  <Card.Text>{fundraiser.description}</Card.Text>
                  <Button
                    className="btn-block btn-danger"
                    onClick={() =>
                      handleDeleteFundraiser(fundraiser.fundraiserId)
                    }
                  >
                    Delete this Fundraiser!
                  </Button>
                </Card.Body>
              </Card>
            );
          })}
        </CardColumns>
      </Container>
    </>
  );
};

export default CreatedFundraiser;
