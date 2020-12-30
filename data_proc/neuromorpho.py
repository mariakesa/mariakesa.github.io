from genepy3d.obj.trees import Tree
import matplotlib as mpl
import matplotlib.pyplot as plt
from mpl_toolkits import mplot3d

#From http://neuromorpho.org/neuron_info.jsp?neuron_name=Neuron-2-2
filename = "Neuron-2-2.CNG.swc"
neuron = Tree.from_swc(filename)
print('Neuron converted!')
short_summary = neuron.summary()
print(short_summary)
print(neuron.get_branchingnodes())

fig = plt.figure()
ax = fig.add_subplot(111,projection="3d")
neuron.plot(ax)
plt.tight_layout()
plt.show()
