import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Manifest } from '../../types/manifest';
import { useQuery } from '@tanstack/react-query';
import { DataTable, Icon } from '../../components';
import { createColumnHelper } from '@tanstack/react-table';
import { format } from 'date-fns';
import { capitalizeFirst } from '../../utils/capatalizeFirst';
import { AiFillDelete, AiFillEdit, AiFillEye } from 'react-icons/ai';

const ManifestsUpdatesPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { data: updates } = useQuery<Manifest[]>({
    queryKey: ['manifest/updates'],
  });

  const approveUpdate = async () => {};
  const deleteUpdate = async () => {};
  const publishUpdate = async () => {};

  const appRequestColumnHelper = createColumnHelper<Manifest>();
  const appRequestColumns = useMemo(
    () => [
      appRequestColumnHelper.accessor('updateId', {
        header: 'Update Id',
        cell: (uniqueIdentifier) => uniqueIdentifier.getValue(),
      }),
      appRequestColumnHelper.accessor('parentManifestId', {
        header: 'Manifest ID',
        cell: (uniqueIdentifier) => uniqueIdentifier.getValue(),
      }),
      appRequestColumnHelper.accessor('createdAt', {
        header: 'Created At',
        cell: (uniqueIdentifier) =>
          format(
            new Date(uniqueIdentifier.getValue() ?? ''),
            'dd-MM-yyyy hh:mm a'
          ),
      }),
      appRequestColumnHelper.accessor('status', {
        header: 'Status',
        cell: (uniqueIdentifier) =>
          capitalizeFirst(uniqueIdentifier.getValue() ?? '').replaceAll(
            '_',
            ' '
          ),
      }),
      appRequestColumnHelper.display({
        header: '',
        cell: (props) => (
          <Icon
            icon={
              <AiFillEye
                fontSize={22}
                color="rgba(36, 89, 158, 1)"
                onClick={() =>
                  navigate(
                    `/centops/manifests/details/${props.row.original.updateId}`,
                    {
                      state: props.row.original,
                    }
                  )
                }
              />
            }
            size="medium"
          />
        ),
        id: 'view',
        meta: {
          size: '1%',
        },
      }),
      appRequestColumnHelper.display({
        header: '',
        cell: (props) => (
          <Icon
            icon={
              <AiFillEdit
                fontSize={22}
                color="rgba(36, 89, 158, 1)"
                onClick={() =>
                  navigate(`/centops/manifests/create_edit`, {
                    state: props.row.original,
                  })
                }
              />
            }
            size="medium"
          />
        ),
        id: 'edit',
        meta: {
          size: '1%',
        },
      }),
      appRequestColumnHelper.display({
        header: '',
        cell: (props) => (
          <Icon
            icon={
              <AiFillDelete
                fontSize={22}
                color="rgba(210, 4, 45, 1)"
                onClick={() => deleteUpdate()}
              />
            }
            size="medium"
          />
        ),
        id: 'delete',
        meta: {
          size: '1%',
        },
      }),
    ],
    [updates, appRequestColumnHelper, t]
  );

  return (
    <>
      <h2>{t('menu.updates')}</h2>
      {updates && updates.length > 0 && (
        <DataTable data={updates} columns={appRequestColumns} />
      )}
    </>
  );
};
export default ManifestsUpdatesPage;
