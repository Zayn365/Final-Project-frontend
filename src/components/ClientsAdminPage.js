import React, { useEffect, useState, useMemo } from "react";
import { Table, Form } from "react-bootstrap";
import axios from "../axios";
import Loading from "./Loading";

function ClientsAdminPage() {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    axios
      .get("/users")
      .then(({ data }) => {
        setUsers(data);
        setLoading(false);
      })
      .catch((e) => {
        setLoading(false);
        console.log(e);
      });
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter(
      (u) =>
        u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  if (loading) return <Loading />;
  if (users.length === 0)
    return <h2 className="py-2 text-center">No users yet</h2>;

  return (
    <>
      {/* Search */}
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <Form.Control
          type="search"
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ maxWidth: "300px" }}
        />
        <div className="text-muted small">
          Showing {filteredUsers.length} result(s)
        </div>
      </div>

      <Table responsive striped bordered hover className="bg-white shadow-sm">
        <thead className="table-light">
          <tr>
            <th>Client ID</th>
            <th>Client Name</th>
            <th>Email</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map((user) => (
            <tr key={user._id}>
              <td>{user._id}</td>
              <td>{user.name}</td>
              <td>{user.email}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  );
}

export default ClientsAdminPage;
