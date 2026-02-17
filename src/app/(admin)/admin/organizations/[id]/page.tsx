"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { SurfaceCard } from "@/components/ui/SurfaceCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Textarea } from "@/components/ui/Textarea";
import { Skeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";
import { listOrganizations, verifyOrganization, unverifyOrganization } from "@/lib/actions";
import { mapOrganizationProfile } from "@/lib/mappers";
import type { OrganizationProfile } from "@/types";

export default function AdminOrgDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();

  const [org, setOrg] = useState<OrganizationProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [approveModal, setApproveModal] = useState(false);
  const [rejectModal, setRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    async function load() {
      // Fetch all orgs and find by ID
      const { data } = await listOrganizations();
      if (data) {
        const found = data.map(mapOrganizationProfile).find((o) => o.id === params.id);
        setOrg(found ?? null);
      }
      setLoading(false);
    }
    load();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex flex-col gap-6 max-w-2xl">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!org) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-text-primary mb-2">Organization not found</h2>
          <Button variant="outline" onClick={() => router.push("/admin/organizations")}>Back</Button>
        </div>
      </div>
    );
  }

  const handleApprove = async () => {
    setActionLoading(true);
    const { error } = await verifyOrganization(org.id);
    setActionLoading(false);
    if (error) {
      toast("error", error);
    } else {
      toast("success", `${org.name} has been approved as a verified organization.`);
      setApproveModal(false);
      router.push("/admin/organizations");
    }
  };

  const handleReject = async () => {
    setActionLoading(true);
    const { error } = await unverifyOrganization(org.id);
    setActionLoading(false);
    if (error) {
      toast("error", error);
    } else {
      toast("warning", `${org.name} has been rejected.`);
      setRejectModal(false);
      router.push("/admin/organizations");
    }
  };

  return (
    <div className="max-w-2xl">
      <Button variant="ghost" size="sm" className="mb-4" onClick={() => router.push("/admin/organizations")}>
        &larr; Back to Queue
      </Button>

      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold text-text-primary">{org.name}</h1>
        {org.verified ? (
          <Badge variant="success">Verified</Badge>
        ) : (
          <Badge variant="warning">Pending</Badge>
        )}
      </div>

      <div className="flex flex-col gap-6">
        <SurfaceCard spotlight padding="md">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent text-white text-xl font-bold">
              {org.name.charAt(0)}
            </div>
            <div>
              <p className="text-lg font-semibold text-text-primary">{org.name}</p>
              <p className="text-sm text-muted">{org.city}</p>
            </div>
          </div>

          {org.about && (
            <div className="mb-4">
              <p className="text-xs text-muted mb-1">About</p>
              <p className="text-sm text-text-primary">{org.about}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 text-sm">
            {org.links.instagram && (
              <div>
                <p className="text-xs text-muted">Instagram</p>
                <p className="text-text-primary">{org.links.instagram}</p>
              </div>
            )}
            {org.links.website && (
              <div>
                <p className="text-xs text-muted">Website</p>
                <p className="text-text-primary">{org.links.website}</p>
              </div>
            )}
            {org.contacts.telegram && (
              <div>
                <p className="text-xs text-muted">Telegram</p>
                <p className="text-text-primary">{org.contacts.telegram}</p>
              </div>
            )}
            {org.contacts.phone && (
              <div>
                <p className="text-xs text-muted">Phone</p>
                <p className="text-text-primary">{org.contacts.phone}</p>
              </div>
            )}
          </div>
        </SurfaceCard>

        {/* Action bar */}
        {!org.verified && (
          <div className="flex items-center gap-3">
            <Button variant="primary" onClick={() => setApproveModal(true)}>
              Approve Organization
            </Button>
            <Button variant="danger" onClick={() => setRejectModal(true)}>
              Reject
            </Button>
          </div>
        )}
      </div>

      {/* Approve Modal */}
      <Modal
        open={approveModal}
        onClose={() => setApproveModal(false)}
        title="Approve Organization"
        footer={
          <>
            <Button variant="ghost" onClick={() => setApproveModal(false)}>Cancel</Button>
            <Button variant="primary" loading={actionLoading} onClick={handleApprove}>Approve</Button>
          </>
        }
      >
        <p className="text-sm text-text-primary">
          Approve <strong>{org.name}</strong> as a verified organization? They will be able to create opportunities and manage candidates.
        </p>
      </Modal>

      {/* Reject Modal */}
      <Modal
        open={rejectModal}
        onClose={() => setRejectModal(false)}
        title="Reject Organization"
        variant="danger"
        footer={
          <>
            <Button variant="ghost" onClick={() => setRejectModal(false)}>Cancel</Button>
            <Button variant="danger" loading={actionLoading} onClick={handleReject}>Reject</Button>
          </>
        }
      >
        <p className="text-sm text-text-primary mb-3">
          Reject <strong>{org.name}</strong>? Provide a reason below.
        </p>
        <Textarea
          placeholder="Reason for rejection..."
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
        />
      </Modal>
    </div>
  );
}
