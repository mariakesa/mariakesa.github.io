We fit an animate-inanimate logistic decoder on 39,209 neuron calcium event probabilities 
over 118 displayed images with a leave-one-out protocol with the Adam optimizer. 

We get the following stats:

Adam accuracy: 0.7203
Adam bal acc:  0.7183
Adam AUC:      0.8004

The confusion matrix is:
                Predicted inanimate Predicted animate
True inanimate [[47 15]
True animate [18 38]]

The relationships between the classifier directions can be described by the angle
between them:

Min axis angle:    34.801189 degrees, folds (87, 109)
Max axis angle:    38.776343 degrees, folds (14, 93)
Mean axis angle:   36.678939 degrees
Median axis angle: 36.648414 degrees

Logistic regression gives us a direction that new samples can be projected on. It's
the normal direction to the separating hyperplane. Given that we found 118
directions that perform well on their respective leave-one-out sample,
we would like to know if the directions the procedure finds are special in the
sense that the held-out image has a systematic signed angular tilt toward the learned 
animacy direction, after normalizing by the magnitude of its projection into the orthogonal neural subspace. 
This procedure is similar to the t-statistic
except in the t-statistic the distribution of projections is an isotropic sphere.
Therefore, we use leave-one-out evaluation and permutation testing rather than relying on the theoretical t-distribution directly.

The formula for the test statistic is:
\[
a_i
=
\sqrt{d-1}
\frac{
\langle x_i, u_{-i} \rangle
}{
\left\|x_i - \langle x_i, u_{-i} \rangle u_{-i}\right\|
}
\]

Here, \(x_i \in \mathbb{R}^d\) is the neural response vector for the held-out image \(i\), and \(u_{-i}\) is the unit-norm logistic decoder direction learned from all images except image \(i\). The statistic

\[
a_i
=
\sqrt{d-1}
\frac{
\langle x_i, u_{-i} \rangle
}{
\left\|x_i - \langle x_i, u_{-i} \rangle u_{-i}\right\|
}
\]

measures the signed angular alignment of the held-out neural response with the learned animacy direction.

The numerator,

\[
\langle x_i, u_{-i} \rangle,
\]

is the signed projection of the held-out response onto the animacy axis. Positive values indicate that the response points toward the animate side of the decoder axis, while negative values indicate that it points toward the inanimate side.

The denominator,

\[
\left\|x_i - \langle x_i, u_{-i} \rangle u_{-i}\right\|,
\]

is the length of the component of \(x_i\) orthogonal to the animacy direction. It measures how much of the neural response lies in all remaining directions of the population response space.

Thus, \(a_i\) compares the response's signed component along the learned animacy axis against the magnitude of its residual component in the orthogonal neural subspace. The factor \(\sqrt{d-1}\) mirrors the geometry of the classical \(t\)-statistic, where one distinguished direction is compared against \(d-1\) residual directions.

In more simple terms, the equation is:

\[
a_i
=
\sqrt{d-1}
\frac{
\text{component along distinguished direction}
}{
\text{orthogonal residual length}
}
\]

For each held-out image, we computed a cross-validated hypersphere/t-style angle score. This score compares the signed projection of the held-out neural response vector onto the Adam-learned animacy direction against the magnitude of its component in the orthogonal neural subspace.

The resulting scores separated the two image classes. Inanimate images had a mean angle score of (-3.641405), while animate images had a mean angle score of (+3.429059). The observed animate-minus-inanimate difference was therefore (+7.070464). The AUC of the angle score alone was (0.798099), close to the AUC of the logistic decoder.

To test whether this separation could arise from arbitrary label assignment, we performed a permutation test by repeatedly shuffling the animate/inanimate labels and recomputing the difference in mean angle score between the two groups. Under the permutation null, the mean difference was close to zero, (+0.018682), with standard deviation (1.274975). The central 95% range of the null distribution was approximately ([-2.461047,\ 2.585029]).

The observed difference of (+7.070464) was far outside this permutation range. The one-sided permutation p-value for animate images having larger angle scores than inanimate images was (0.00009999), and the two-sided p-value was also (0.00009999).



#