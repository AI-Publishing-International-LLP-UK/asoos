'use client';

import React from 'react';

import { useRouter } from 'next/navigation';

import { Button, Card, CardContent, CardHeader, Grid, TableContainer } from '@mui/material';
import { object, minLength, string, pipe, nonEmpty } from 'valibot';
import type { InferInput } from 'valibot';
import { valibotResolver } from '@hookform/resolvers/valibot';
import { Controller, useForm } from 'react-hook-form';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import CustomTextField from '@/@core/components/mui/TextField';
import { url, nameElement } from '../contstants';
import { createUserType } from '@/actions/user-type-action';

type FormData = InferInput<typeof schema>

const schema = object({
  name: pipe(string(), nonEmpty(), minLength(3)),
  description: pipe(string(), nonEmpty(), minLength(3))
});

export default function Page() {
  //state
  const router = useRouter();

  //hooks
  const {
    control,
    reset,
    handleSubmit,
    formState: { errors }
  } = useForm<FormData>({
    resolver: valibotResolver(schema),
    defaultValues: {
      name: '',
      description: ''
    }
  });

  const onSubmit = async (value: any) => {
    try {
      const response = await createUserType(value.name, value.description);

      if (response) {
        router.push(`/${url}`);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <ToastContainer />

      <Card>
        <CardHeader title={`Create ${nameElement}`} />
        <CardContent>
          <TableContainer>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Grid container spacing={6}>
                <Grid item xs={12}>
                  <Controller
                    name='name'
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <CustomTextField
                        {...field}
                        fullWidth
                        label='Name'
                        placeholder=''
                        {...(errors.name && { error: true, helperText: errors.name.message })}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Controller
                    name='description'
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <CustomTextField
                        {...field}
                        fullWidth
                        label='Description'
                        placeholder=''
                        {...(errors.description && { error: true, helperText: errors.description.message })}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} className='flex gap-4'>
                  <Button variant='contained' type='submit'>
                    Submit
                  </Button>
                  <Button variant='tonal' color='secondary' type='reset' onClick={() => reset()}>
                    Reset
                  </Button>
                </Grid>
              </Grid>
            </form>
          </TableContainer>
        </CardContent>
      </Card>
    </>
  );
}
