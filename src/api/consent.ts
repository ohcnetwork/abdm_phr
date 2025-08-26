import {
  AutoApprovalUpdateRequest,
  ConsentApproveRequest,
  ConsentArtefact,
  ConsentArtefactResponse,
  ConsentDenyRequest,
  ConsentInitRequest,
  ConsentListResponse,
  ConsentRequest,
  ConsentRequestResponse,
  ConsentRevokeRequest,
  ConsentUpdateBaseResponse,
} from "@/types/consent";
import { API } from "@/utils/request/api";

export const consent = {
  listRequests: API<ConsentListResponse<ConsentRequest>>(
    "GET /phr/consent/requests",
  ),
  getRequest: API<ConsentRequestResponse>(
    "GET /phr/consent/request/{requestId}",
  ),
  listArtefacts: API<ConsentListResponse<ConsentArtefact>>(
    "GET /phr/consent/artefacts",
  ),
  getArtefact: API<ConsentArtefactResponse>(
    "GET /phr/consent/artefact/{artefactId}",
  ),
  getRequestArtefacts: API<ConsentListResponse<ConsentArtefact>>(
    "GET /phr/consent/request/{requestId}/artefacts",
  ),
  approve: API<ConsentUpdateBaseResponse, ConsentApproveRequest>(
    "POST /phr/consent/request/{requestId}/approve",
  ),
  deny: API<ConsentUpdateBaseResponse, ConsentDenyRequest>(
    "POST /phr/consent/request/{requestId}/deny",
  ),
  revoke: API<ConsentUpdateBaseResponse, ConsentRevokeRequest>(
    "POST /phr/consent/revoke",
  ),
  setAutoApproval: API<ConsentUpdateBaseResponse>(
    "POST /phr/consent/auto_approve/setup",
  ),
  updateAutoApproval: API<ConsentUpdateBaseResponse, AutoApprovalUpdateRequest>(
    "POST /phr/consent/auto_approve/{autoApprovalId}/update",
  ),
  init: API<void, ConsentInitRequest>("POST /phr/consent/request_init"),
};
