#include "../Common.h"

namespace MFEM{
    void ComputeFemMassMatrix1_forward(int64 *indices, double *vv, const double *rho){
        int elem_ndof = mmesh.elem_ndof;
        Eigen::MatrixXd N(elem_ndof, 1);
        int k = 0;
        int k0 = 0;
        for(int i = 0; i<mmesh.nelem; i++){
            NNFEM_Element * elem = mmesh.elements[i];
            for (int j = 0; j< elem->ngauss; j++){
                for (int r = 0; r < elem_ndof; r ++)
                    N(r, 0) = elem->h(r, j);
                
                Eigen::MatrixXd NN = N * N.transpose() * rho[k0++] * elem->w[j];

                for(int l = 0; l < elem_ndof; l++){
                    for(int s = 0; s < elem_ndof; s ++){
                        int idx1 = elem->dof[l];
                        int idx2 = elem->dof[s];
                        indices[2*k] = idx1;
                        indices[2*k+1] = idx2;
                        vv[k] = NN(l, s);
                        k ++; 
                    }
                }
            }
        }
    }

    void ComputeFemMassMatrix1_backward(
        double * grad_rho, 
        const double *grad_vv, 
        const double *vv, const double *rho){
        int elem_ndof = mmesh.elem_ndof;
        Eigen::MatrixXd N(elem_ndof, 1);
        int k = 0, k0 = 0;
        for(int i = 0; i<mmesh.nelem; i++){
            NNFEM_Element * elem = mmesh.elements[i];
            for (int j = 0; j< elem->ngauss; j++){
                for (int r = 0; r < elem_ndof; r++)
                    N(r, 0) = elem->h(r, j);
    
                Eigen::MatrixXd NN = N * N.transpose() * elem->w[j];
                for(int l = 0; l < elem_ndof; l++){
                    for(int s = 0; s < elem_ndof; s ++){
                        int idx1 = elem->dof[l];
                        int idx2 = elem->dof[s];
                        grad_rho[k0] += NN(l, s) * grad_vv[k];
                        k ++; 
                    }
                }
                k0++;
            }
        }
    }
}